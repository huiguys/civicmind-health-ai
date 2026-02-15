# 🏥 CivicMind – AI Health Companion for Bharat

![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)
![React Native](https://img.shields.io/badge/react_native-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![AI For Bharat](https://img.shields.io/badge/Hackathon-AI_for_Bharat-blue?style=for-the-badge)

**CivicMind: We don’t just store health records; we understand them.** 🚀

CivicMind is an AI-powered health intelligence platform built on top of India’s ABHA (Ayushman Bharat Health Account) ecosystem. It actively translates, understands, and analyzes medical data to empower patients and reduce doctors’ administrative workload, democratizing elite healthcare across Tier-2 and Tier-3 India.

---

## ⚠️ The Problem Statement

**For Patients:**
* Medical reports are complex, jargon-heavy, and written entirely in English.
* Language barriers cause confusion, unnecessary panic, and poor health decisions.
* There is no personalized lifestyle guidance based on their actual clinical history.

**For Doctors:**
* High administrative burden due to manual data entry and typing prescriptions.
* Fragmented access to a patient's long-term medical history.
* Less time focused on actual patient care.

---

## 💡 Our Solution: An Active AI Intelligence Layer
Unlike traditional health apps that only act as passive "PDF viewers" for ABHA records, CivicMind introduces an **Active AI Intelligence Layer**. CivicMind actively:
1. **Reads & Understands** legacy medical records using OCR.
2. **Translates** clinical jargon into simple, local languages.
3. **Analyzes** new inputs in real-time (voice dictation, new prescriptions, food images).
4. **Provides** actionable, medical-grade insights and safety guardrails.

### 🌟 Core Features
* **🗣️ Universal Medical Translator:** Reads English ABHA reports via AWS Textract and explains them in the patient's local language using Claude 3.
* **🎙️ Voice-Based Auto-Update:** Doctors speak prescriptions, and AWS HealthScribe automatically converts it into a structured digital record.
* **🛡️ The "Silent Guardian":** An active background safety check powered by Amazon Comprehend Medical that alerts doctors to dangerous drug interactions.
* **🍎 Nutri-Scanner:** Medical-grade food and diet analysis based purely on the patient's unique clinical blood reports.
* **💙 Empathy Filter:** GenAI dynamically softens the delivery of critical medical news to prevent patient panic and encourage professional consultation.

---

## ⚙️ Core Technologies
Built entirely on an enterprise-grade, serverless AWS architecture:
* 🧠 **Generative AI:** Amazon Bedrock (Claude 3)
* 🏥 **Medical NLP:** Amazon Comprehend Medical
* 🎙️ **Voice-to-Text:** AWS HealthScribe
* 📄 **Document OCR:** AWS Textract
* ⚡ **Backend:** AWS Lambda (Serverless) & Node.js
* 💾 **Database:** Amazon DynamoDB
* 📱 **Frontend:** React Native
* 🏛️ **Health APIs:** ABDM (ABHA) Sandbox APIs

---

## 🏗️ Architecture & Specifications
This repository contains the enterprise-grade technical specifications, requirements (EARS format), and Mermaid.js architecture data flows generated for the AI for Bharat Hackathon.
* Navigate to the `.kiro/specs/civicmind-health-ai/` folder to view the complete `design.md` and `requirements.md` files.

---

## 👨‍💻 Team CivicMind
Built with ❤️ for the AWS AI for Bharat Hackathon.
* **Srinivasa P M** (Team Leader)
* **Spandana H N**
* **Ria Goyal**
* **Nidith V S**
