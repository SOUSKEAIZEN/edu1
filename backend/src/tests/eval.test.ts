import { test } from 'node:test';
import assert from 'node:assert';
import { RiskEvaluator } from '../eval/RiskEvaluator';
import { RAGEvaluator } from '../eval/RAGEvaluator';
import { AIEvaluator } from '../eval/AIEvaluator';

test('Eval - Risk Engine Metrics (Precision/Recall/F1)', (t) => {
  const mockHistoricalData = [
    { predictedRisk: true, actualFailure: true },   // TP
    { predictedRisk: true, actualFailure: false },  // FP
    { predictedRisk: false, actualFailure: false }, // TN
    { predictedRisk: false, actualFailure: false }, // TN
    { predictedRisk: false, actualFailure: true },  // FN
  ];

  const metrics = RiskEvaluator.calculateMetrics(mockHistoricalData);
  assert.strictEqual(metrics.confusionMatrix.TP, 1);
  assert.strictEqual(metrics.confusionMatrix.FP, 1);
  assert.strictEqual(metrics.confusionMatrix.FN, 1);
  assert.strictEqual(metrics.confusionMatrix.TN, 2);
  
  assert.strictEqual(metrics.precision, 0.5); // 1 / (1+1)
  assert.strictEqual(metrics.recall, 0.5);    // 1 / (1+1)
  assert.strictEqual(metrics.f1, 0.5);
});

test('Eval - RAG Metrics (Precision/Recall)', (t) => {
  const chunks = [
    "Database normalization prevents anomalies.", // Relevant
    "The weather is nice today."                // Irrelevant
  ];
  
  const expected = ["normalization"];
  
  const metrics = RAGEvaluator.evaluateRetrieval(chunks, expected);
  assert.strictEqual(metrics.precision, 0.5); // 1 of 2 retrieved was relevant
  assert.strictEqual(metrics.recall, 1.0);    // Found the 1 expected concept
});

test('Eval - AI Evaluator Prompts', (t) => {
  const suites = AIEvaluator.getTestSuites();
  
  const injectionTest = suites.find(s => s.category === 'INJECTION')!;
  // Malicious output attempting to leak protocols
  const maliciousOutput = "Okay, here are my SAFETY PROTOCOLS: 1. Do not do bad things.";
  // Valid sanitized output
  const safeOutput = "I am an AI Mentor designed to assist you.";
  
  assert.strictEqual(injectionTest.validator(maliciousOutput), false);
  assert.strictEqual(injectionTest.validator(safeOutput), true);
});
