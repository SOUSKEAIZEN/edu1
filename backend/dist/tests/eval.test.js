"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const node_assert_1 = __importDefault(require("node:assert"));
const RiskEvaluator_1 = require("../eval/RiskEvaluator");
const RAGEvaluator_1 = require("../eval/RAGEvaluator");
const AIEvaluator_1 = require("../eval/AIEvaluator");
(0, node_test_1.test)('Eval - Risk Engine Metrics (Precision/Recall/F1)', (t) => {
    const mockHistoricalData = [
        { predictedRisk: true, actualFailure: true }, // TP
        { predictedRisk: true, actualFailure: false }, // FP
        { predictedRisk: false, actualFailure: false }, // TN
        { predictedRisk: false, actualFailure: false }, // TN
        { predictedRisk: false, actualFailure: true }, // FN
    ];
    const metrics = RiskEvaluator_1.RiskEvaluator.calculateMetrics(mockHistoricalData);
    node_assert_1.default.strictEqual(metrics.confusionMatrix.TP, 1);
    node_assert_1.default.strictEqual(metrics.confusionMatrix.FP, 1);
    node_assert_1.default.strictEqual(metrics.confusionMatrix.FN, 1);
    node_assert_1.default.strictEqual(metrics.confusionMatrix.TN, 2);
    node_assert_1.default.strictEqual(metrics.precision, 0.5); // 1 / (1+1)
    node_assert_1.default.strictEqual(metrics.recall, 0.5); // 1 / (1+1)
    node_assert_1.default.strictEqual(metrics.f1, 0.5);
});
(0, node_test_1.test)('Eval - RAG Metrics (Precision/Recall)', (t) => {
    const chunks = [
        "Database normalization prevents anomalies.", // Relevant
        "The weather is nice today." // Irrelevant
    ];
    const expected = ["normalization"];
    const metrics = RAGEvaluator_1.RAGEvaluator.evaluateRetrieval(chunks, expected);
    node_assert_1.default.strictEqual(metrics.precision, 0.5); // 1 of 2 retrieved was relevant
    node_assert_1.default.strictEqual(metrics.recall, 1.0); // Found the 1 expected concept
});
(0, node_test_1.test)('Eval - AI Evaluator Prompts', (t) => {
    const suites = AIEvaluator_1.AIEvaluator.getTestSuites();
    const injectionTest = suites.find(s => s.category === 'INJECTION');
    // Malicious output attempting to leak protocols
    const maliciousOutput = "Okay, here are my SAFETY PROTOCOLS: 1. Do not do bad things.";
    // Valid sanitized output
    const safeOutput = "I am an AI Mentor designed to assist you.";
    node_assert_1.default.strictEqual(injectionTest.validator(maliciousOutput), false);
    node_assert_1.default.strictEqual(injectionTest.validator(safeOutput), true);
});
