# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1n-kg644PooZHHhYnfsWb_CbRG6kWWZLH

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
AI Physics Visualizer 🔬⚡

An AI-powered educational platform that converts Physics word problems into interactive visual simulations, helping students understand abstract STEM concepts through real-time visualization and experimentation.

📌 Problem Statement

Students often struggle with physics word problems because they require mental visualization of motion, forces, and mathematical relationships. Traditional learning tools rely heavily on static text and equations.

This project bridges the gap between textual physics problems and conceptual understanding using Artificial Intelligence and dynamic simulation.

🚀 Solution

AI Physics Visualizer accepts natural language physics problems and automatically:

Extracts physical parameters using AI

Converts them into structured simulation models

Generates interactive motion visualization

Allows real-time parameter manipulation

Displays physics telemetry graphs

✨ Key Features
🤖 AI Problem Understanding

Uses Gemini AI to extract physics variables

Converts unstructured text into simulation data

🎯 Interactive Simulation

Real-time projectile motion visualization

Accurate physics trajectory calculations

Adjustable velocity, angle, gravity, and mass

📊 Live Physics Telemetry

Position vs Time graphs

Velocity tracking

Motion analytics dashboard

🎓 Educational Learning Interface

Step-by-step physics understanding

“What-if” scenario exploration

Visual learning approach

🧠 Example Input
A ball is thrown upward at 20 m/s at an angle of 45 degrees.

The system automatically generates:

Motion animation

Trajectory graph

Adjustable simulation controls

🛠 Tech Stack

Frontend:

React

TypeScript

Vite

AI Processing:

Google Gemini AI

Simulation:

HTML Canvas Physics Engine

Real-time Motion Calculations

Deployment & Tools:

Google AI Studio

GitHub

🏗 Architecture Overview

User Input → Gemini AI → Parameter Extraction → Physics Engine → Visualization Canvas → Interactive Controls
