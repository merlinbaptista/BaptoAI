# Bapto AI – Your Screen-Shared ChatGPT Companion

![Bapto AI Banner](./assets/bapto-preview.jpg) <!-- Replace with actual path -->

## Overview

**Bapto AI** is a real-time, intelligent screen-sharing assistant that integrates with ChatGPT-like models to help users solve problems directly on their screen. Whether you’re editing videos in Adobe Premiere Pro or struggling with buttons in After Effects, Bapto floats above your workspace as a voice-enabled AI, ready to assist through smart chat or speech.

---

## Features

- ChatGPT-like assistance that understands your screen and provides real-time help
- On-screen guidance through UI element detection and context-aware suggestions
- Voice interaction with speech synthesis for hands-free support
- Mouse tracking to interpret user intent and focus
- Multi-AI support using ChatGPT, Gemini Pro, and OpenRouter APIs
- Visual recognition powered by Roboflow to detect screen elements
- Floating overlay UI that works across apps without interrupting workflow
- Subscription-ready infrastructure for monetization

---

## Inspiration

As a passionate video editor and graphic designer, I often found myself struggling to locate tools or resolve issues within complex software like Adobe Premiere Pro or After Effects.

I used to take screenshots and send them to ChatGPT manually to ask for help. But this process was slow and disrupted my workflow.

That’s when the idea hit me:

*"What if there was a floating AI assistant that could watch my screen and guide me instantly?"*

And thus, **Bapto AI** was born.

---

## What I Learned

- Building modern web apps that interact with live screen content
- Integrating multiple AI models and managing performance
- Real-time mouse tracking and element recognition
- Using Roboflow for object detection on-screen
- Secure API key management with `.env` files
- Creating responsive voice feedback and overlay chat UI

---

## How I Built It

- **Frontend**: React + TypeScript + TailwindCSS (via Vite)
- **AI Services**: ChatGPT, Gemini Pro, OpenRouter APIs
- **Vision Support**: Roboflow
- **User Interaction**: ScreenInteractionManager, MouseTracking modules
- **Voice Feedback**: Speech synthesis (Web Speech API or external library)
- **Subscription System**: RevenueCat integration-ready
- **Tooling**: PostCSS, ESLint, .env configurations

---

## Challenges Faced

- Designing a floating overlay chatbot that doesn't block user interaction
- Capturing screen content efficiently without sacrificing performance
- Balancing frequent screenshot analysis with fast AI response times
- Managing concurrent AI services in one unified interface
- Preparing authentication and monetization workflows for scaling

---

## Sneak Peek

![Bapto AI Interface Preview](./assets/bapto-preview.jpg) <!-- Replace with actual image path -->

---

## What's Next

- Optimizing screenshot speed and image compression
- Adding multilingual voice support for wider accessibility
- Full RevenueCat subscription integration for premium features
- A native desktop version for tighter integration with creative software

---

## License

MIT License. See [LICENSE](./LICENSE) for details.

---

## Contact

Built with passion by Merlin Baptista. For queries or collaborations, reach out at [your-email@example.com].

