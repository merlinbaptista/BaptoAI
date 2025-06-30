
# Bapto AI – Your Screen-Shared ChatGPT Companion

Bapto AI is a real-time, intelligent screen-sharing assistant that helps users navigate complex software by integrating powerful AI models such as ChatGPT, Gemini, and OpenRouter. Whether you're working in Adobe Premiere Pro, After Effects, or any design tool, Bapto floats over your screen and provides instant, voice-enabled support based on what you see and do.

---

## Features

- Real-time, floating AI assistant
- Context-aware responses based on screen content
- Voice interaction using speech synthesis
- AI integration with ChatGPT, Gemini Pro, and OpenRouter
- On-screen UI element recognition using Roboflow
- Mouse tracking and interaction detection
- Modular architecture built with modern web technologies
- Secure `.env`-based configuration
- Scalable setup with subscription-ready infrastructure

---

## Inspiration

As a passionate video editor and graphic designer, I often found myself struggling to locate tools or resolve issues within complex software like Adobe Premiere Pro or After Effects.

I used to take screenshots and send them to ChatGPT manually to ask for help, but that process was slow and disrupted my creative flow.

That’s when the idea struck:

*"What if there was a floating AI assistant that could watch my screen and guide me instantly?"*

And thus, **Bapto AI** was born.

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/bapto-ai.git
cd bapto-ai/project
```

### 2. Install Dependencies

Make sure you have **Node.js (v18+)** installed.

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `project/` directory. Example:

```env
VITE_OPENROUTER_API_KEY=your_openrouter_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_SOME_OTHER_ENV=your_value
```

> Note: Never share your `.env` file publicly.

### 4. Run the App in Development Mode

```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) to see the app running locally.

---

## Project Structure

```
project/
├── public/                 # Static assets
├── src/                    # Main application source
│   ├── components/         # React components
│   ├── services/           # API utilities and logic
│   ├── App.tsx             # Main app logic
│   └── main.tsx            # App entry point
├── .env                    # Environment variables
├── package.json            # Dependencies and scripts
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # TailwindCSS setup
├── tsconfig.json           # TypeScript configuration
└── index.html              # App container
```

---

## How It Works

- **Frontend**: Built using React, TypeScript, and TailwindCSS via Vite
- **AI Services**: ChatGPT, Gemini Pro, OpenRouter APIs
- **Visual Recognition**: Roboflow for screen element detection
- **Voice Interaction**: Web Speech API or external TTS libraries
- **Mouse/Screen Tracking**: Custom utilities to detect user focus
- **Overlay UI**: Responsive floating assistant design
- **Environment Management**: Using `.env` for secure key handling

---

## Challenges Faced

- Developing a chatbot UI that doesn’t interfere with screen activity
- Capturing screen images efficiently while maintaining performance
- Integrating and managing multiple AI APIs simultaneously
- Handling real-time feedback with minimal latency
- Planning for monetization via subscription (RevenueCat-ready)

---

## Available Scripts

```bash
npm run dev         # Starts the development server
npm run build       # Builds the app for production
npm run preview     # Previews the production build
npm run lint        # Runs ESLint for code quality checks
```

---

## Deployment

You can deploy this app using platforms like:

- Vercel: https://vercel.com/
- Netlify: https://www.netlify.com/
- Render: https://render.com/

> Make sure to add all required `.env` variables in the deployment platform's environment settings.

---

## What's Next

- Optimizing screenshot frequency and compression techniques
- Adding multilingual voice interaction
- Full integration with RevenueCat for premium plans
- Building a native desktop version for more seamless software support

---

## License

This project is licensed under the MIT License.  
See the [`LICENSE`](./LICENSE) file for details.

---

Created and maintained by **Merlin Baptista**.  
