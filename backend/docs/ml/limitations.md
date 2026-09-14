# AI & ML Limitations Document

## 1. Causal Effectiveness Statement
**DISCLAIMER**: The GTU Student Mentoring Platform does NOT currently claim that "AI improves student performance." 

While the system is designed to provide timely interventions, recommendations, and academic insights, there is currently no appropriately designed randomized controlled trial (RCT) or empirical study establishing a causal link between platform usage and GPA improvement.

All tracked "Outcome Changes" in the `recommendation_metrics` and `mentor_interventions` tables are **correlational** tracking tools intended for operational mentor feedback, not scientific proof of efficacy.

## 2. Risk Engine Limitations
The Phase 5 Risk Engine is a **deterministic, rule-based heuristic engine**, not a predictive Machine Learning model. 
- **Limitation**: It cannot predict unseen or complex socio-economic failure factors outside of the hardcoded data constraints (attendance drops, deadline misses, GPA drops).
- **Evaluation**: We evaluate it using Precision, Recall, and F1 against historical labeled failures, but true probability calibration requires more historical semester data than is currently available.

## 3. RAG Retrieval Limitations
- **Semantic Drift**: Semantic chunking relies on vector cosine similarity. High similarity scores do not guarantee factual correctness, only semantic proximity.
- **Outdated Contexts**: If administrators fail to upload the newest syllabus, the AI will confidently hallucinate based on the old version (though `is_active` versioning mitigates this if managed properly).

## 4. LLM Hallucinations
- Despite strict `AIPipeline.ts` grounding rules and anti-fabrication prompt engineering, LLMs can theoretically hallucinate data. 
- **Mitigation**: The UI explicitly flags AI messages and instructs students to verify critical deadlines with the source dashboard or their human mentor.
