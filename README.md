## 🌐 Metaverse — A 2D Virtual World Prototype  

**Metaverse** is my personal attempt at building a simplified clone of a 2D metaverse platform.  
It focuses on the **core architecture** and **real-time multi-user interaction**, allowing people to join virtual rooms and move around together.  

This initial version intentionally leaves out heavy graphics or animations — the goal is to build a **scalable, modular foundation** for future expansions.  

### 🚀 Core Goals  
- 🧩 Real-time user movement and synchronization  
- ⚙️ Scalable, modular backend design  
- 🔌 WebSocket-driven live communication  
- 🪶 Lightweight 2D experience for quick experimentation  

### 🎨 Future Enhancements 
- Smooth animations and rich UI interactions  
- Custom avatars and visual themes  
- Persistent rooms and user states  


## 🏁 Getting Started  

Follow these steps to set up and run the project locally.


### 📦 Clone the Repository

```bash
git clone https://github.com/Sathwik004/Metaverse.git
cd Metaverse
```
### ⚙️ Start the development environment with Docker Compose
```bash
docker-compose up --build
```

## 🗂️ Project Structure

Here’s a quick overview of the repository layout:

```
Metaverse/
├─ apps/
│  ├─ frontend/                 # Next.js frontend
│  ├─ backend/                  # Node + Express backend
│  └─ ws/                       # Websockets for virtual rooms
│
├─ packages/
│  ├─ db/                       # Prisma ORM
│  ├─ ui/                       # Shared UI components
│  ├─ eslint-config/            # Shared linting rules
│  └─ typescript-config/        # Shared TS configuration
│
├─ tests/                       # Contains test cases
│
│
├─ Docker/                      # Contains all Docker files
│  ├─ Dockerfile.backend.dev/                   
│  ├─ Dockerfile.frontend.dev/        
│  └─ Dockerfile.ws.dev/    
│
├─ turbo.json                   # Turborepo configuration
├─ package.json                 # Root package config
└─ docker-compose.yml

```

