import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import { Order, Product } from "@/lib/db/models";

// GET /api/analytics/recommendations - Product recommendations using association rules
export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const minSupport = parseFloat(searchParams.get("minSupport") || "0.01");
    const minConfidence = parseFloat(searchParams.get("minConfidence") || "0.1");

    // Get all completed orders
    const orders = await Order.find({
      status: { $in: ["completed", "delivered", "shipped"] },
    }).lean();

    // Build transaction list (list of product IDs per order)
    const transactions: string[][] = orders.map((order) => order.items.map((item: { product: { toString: () => string } }) => item.product.toString()));

    // Count item frequencies
    const itemCounts: Record<string, number> = {};
    const pairCounts: Record<string, number> = {};
    const totalTransactions = transactions.length;

    transactions.forEach((transaction) => {
      const uniqueItems = [...new Set(transaction)];

      // Count individual items
      uniqueItems.forEach((item) => {
        itemCounts[item] = (itemCounts[item] || 0) + 1;
      });

      // Count pairs
      for (let i = 0; i < uniqueItems.length; i++) {
        for (let j = i + 1; j < uniqueItems.length; j++) {
          const pair = [uniqueItems[i], uniqueItems[j]].sort().join("|");
          pairCounts[pair] = (pairCounts[pair] || 0) + 1;
        }
      }
    });

    // Generate association rules
    const rules: {
      antecedent: string;
      consequent: string;
      support: number;
      confidence: number;
      lift: number;
    }[] = [];

    for (const [pair, count] of Object.entries(pairCounts)) {
      const [item1, item2] = pair.split("|");
      const support = count / totalTransactions;

      if (support < minSupport) continue;

      // Rule: item1 -> item2
      const confidence1 = count / itemCounts[item1];
      const lift1 = confidence1 / (itemCounts[item2] / totalTransactions);

      if (confidence1 >= minConfidence) {
        rules.push({
          antecedent: item1,
          consequent: item2,
          support,
          confidence: confidence1,
          lift: lift1,
        });
      }

      // Rule: item2 -> item1
      const confidence2 = count / itemCounts[item2];
      const lift2 = confidence2 / (itemCounts[item1] / totalTransactions);

      if (confidence2 >= minConfidence) {
        rules.push({
          antecedent: item2,
          consequent: item1,
          support,
          confidence: confidence2,
          lift: lift2,
        });
      }
    }

    // Sort by lift (most interesting rules first)
    rules.sort((a, b) => b.lift - a.lift);

    // Get product details
    const productIds = [...new Set([...rules.map((r) => r.antecedent), ...rules.map((r) => r.consequent)])];
    const products = await Product.find({ _id: { $in: productIds } })
      .select("name price images")
      .lean();

    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    // Enrich rules with product details
    const enrichedRules = rules.slice(0, 50).map((rule) => ({
      ...rule,
      antecedentProduct: productMap.get(rule.antecedent) || { name: "Unknown" },
      consequentProduct: productMap.get(rule.consequent) || { name: "Unknown" },
    }));

    // If specific product requested, filter recommendations
    let recommendations: typeof enrichedRules = [];
    if (productId) {
      recommendations = enrichedRules.filter((rule) => rule.antecedent === productId).sort((a, b) => b.confidence - a.confidence);
    }

    // Frequently bought together
    const frequentPairs = Object.entries(pairCounts)
      .filter(([, count]) => count / totalTransactions >= minSupport)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([pair, count]) => {
        const [item1, item2] = pair.split("|");
        return {
          products: [productMap.get(item1) || { name: "Unknown" }, productMap.get(item2) || { name: "Unknown" }],
          frequency: count,
          support: count / totalTransactions,
        };
      });

    return NextResponse.json({
      summary: {
        totalTransactions,
        totalRules: rules.length,
        uniqueProducts: productIds.length,
        minSupport,
        minConfidence,
      },
      rules: enrichedRules,
      recommendations,
      frequentlyBoughtTogether: frequentPairs,
    });
  } catch (error) {
    console.error("Recommendations analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch recommendations" }, { status: 500 });
  }
}
