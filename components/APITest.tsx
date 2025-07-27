"use client";

import { useState, useEffect } from "react";
import { use1inchData } from "@/hooks/use1inchData";

export function APITest() {
  const [testResults, setTestResults] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    tokens,
    commonTokens,
    gasPrice,
    loading: apiLoading,
    error: apiError,
    fetchTokens,
    fetchGasPrice,
    getTokenPrice,
  } = use1inchData({ chainId: 137, autoRefresh: false });

  const runTests = async () => {
    setLoading(true);
    setError("");
    setTestResults({});

    try {
      const results: any = {};

      // Test 1: Fetch tokens
      console.log("Testing: Fetch tokens...");
      await fetchTokens();
      results.tokens = {
        success: tokens.length > 0,
        count: tokens.length,
        sample: tokens
          .slice(0, 3)
          .map((t) => ({ symbol: t.symbol, address: t.address })),
      };

      // Test 2: Fetch gas price
      console.log("Testing: Fetch gas price...");
      await fetchGasPrice();
      results.gasPrice = {
        success: gasPrice !== null,
        data: gasPrice,
      };

      // Test 3: Get specific token price (USDC on Polygon)
      console.log("Testing: Get USDC price...");
      const usdcAddress = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"; // USDC on Polygon
      const usdcPrice = await getTokenPrice(usdcAddress);
      results.usdcPrice = {
        success: usdcPrice > 0,
        price: usdcPrice,
      };

      // Test 4: Direct API call to debug
      try {
        const response = await fetch("/api/1inch/price/v1.1/137");
        const data = await response.json();
        const usdcPriceFromDirect =
          data["0x2791bca1f2de4661ed88a30c99a7a9449aa84174"];
        results.directUsdcPrice = {
          success: !!usdcPriceFromDirect,
          data: {
            usdcAddress: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
            priceInWei: usdcPriceFromDirect,
            priceInMatic: usdcPriceFromDirect
              ? parseFloat(usdcPriceFromDirect) / 1e18
              : 0,
            responseHasKey: Object.keys(data).includes(
              "0x2791bca1f2de4661ed88a30c99a7a9449aa84174"
            ),
            totalKeys: Object.keys(data).length,
            firstFiveKeys: Object.keys(data).slice(0, 5),
          },
        };
      } catch (error) {
        results.directUsdcPrice = {
          success: false,
          data: {
            error: error instanceof Error ? error.message : "Unknown error",
          },
        };
      }

      // Test 4: Check common tokens
      results.commonTokens = {
        success: commonTokens.length > 0,
        count: commonTokens.length,
        symbols: commonTokens.map((t) => t.symbol),
      };

      setTestResults(results);
      console.log("All tests completed:", results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Test failed");
      console.error("Test error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        1inch API Test
      </h2>

      <div className="mb-4">
        <button
          onClick={runTests}
          disabled={loading || apiLoading.tokens}
          className="btn-primary"
        >
          {loading ? "Running Tests..." : "Run API Tests"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-700">Error: {error}</p>
        </div>
      )}

      {apiError.tokens && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-700">API Error: {apiError.tokens}</p>
        </div>
      )}

      {Object.keys(testResults).length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Test Results:</h3>

          {testResults.tokens && (
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="font-medium text-gray-900 mb-2">Tokens Test</h4>
              <div className="text-sm">
                <p>
                  Status:{" "}
                  {testResults.tokens.success ? "✅ Success" : "❌ Failed"}
                </p>
                <p>Count: {testResults.tokens.count}</p>
                <p>
                  Sample:{" "}
                  {testResults.tokens.sample
                    .map((t: any) => t.symbol)
                    .join(", ")}
                </p>
              </div>
            </div>
          )}

          {testResults.gasPrice && (
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="font-medium text-gray-900 mb-2">Gas Price Test</h4>
              <div className="text-sm">
                <p>
                  Status:{" "}
                  {testResults.gasPrice.success ? "✅ Success" : "❌ Failed"}
                </p>
                {testResults.gasPrice.data && (
                  <div>
                    <p>Fast: {testResults.gasPrice.data.fast} gwei</p>
                    <p>Standard: {testResults.gasPrice.data.standard} gwei</p>
                    <p>Slow: {testResults.gasPrice.data.slow} gwei</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {testResults.usdcPrice && (
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="font-medium text-gray-900 mb-2">
                USDC Price Test
              </h4>
              <div className="text-sm">
                <p>
                  Status:{" "}
                  {testResults.usdcPrice.success ? "✅ Success" : "❌ Failed"}
                </p>
                <p>Price: ${testResults.usdcPrice.price.toFixed(4)}</p>
              </div>
            </div>
          )}

          {testResults.directUsdcPrice && (
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="font-medium text-gray-900 mb-2">
                Direct USDC Price Test
              </h4>
              <div className="text-sm">
                <p>
                  Status:{" "}
                  {testResults.directUsdcPrice.success
                    ? "✅ Success"
                    : "❌ Failed"}
                </p>
                {testResults.directUsdcPrice.data && (
                  <div>
                    <p>
                      Price (Wei): {testResults.directUsdcPrice.data.priceInWei}
                    </p>
                    <p>
                      Price (Matic):{" "}
                      {testResults.directUsdcPrice.data.priceInMatic.toFixed(4)}
                    </p>
                    <p>
                      Response has key:{" "}
                      {testResults.directUsdcPrice.data.responseHasKey
                        ? "Yes"
                        : "No"}
                    </p>
                    <p>
                      Total keys: {testResults.directUsdcPrice.data.totalKeys}
                    </p>
                    <p>
                      First 5 keys:{" "}
                      {testResults.directUsdcPrice.data.firstFiveKeys.join(
                        ", "
                      )}
                    </p>
                  </div>
                )}
                {testResults.directUsdcPrice.data.error && (
                  <p>Error: {testResults.directUsdcPrice.data.error}</p>
                )}
              </div>
            </div>
          )}

          {testResults.commonTokens && (
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="font-medium text-gray-900 mb-2">
                Common Tokens Test
              </h4>
              <div className="text-sm">
                <p>
                  Status:{" "}
                  {testResults.commonTokens.success
                    ? "✅ Success"
                    : "❌ Failed"}
                </p>
                <p>Count: {testResults.commonTokens.count}</p>
                <p>Symbols: {testResults.commonTokens.symbols.join(", ")}</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p>Testing on Polygon (Chain ID: 137)</p>
        <p>
          API Key:{" "}
          {process.env.NEXT_PUBLIC_1INCH_API_KEY ? "✅ Set" : "❌ Missing"}
        </p>
      </div>
    </div>
  );
}
