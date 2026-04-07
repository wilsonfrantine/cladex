# CladeX 🌿🧬

**CladeX** is an interactive, gamified phylogenetic simulator designed to bridge the gap between abstract evolutionary theory and practical tree-thinking. It helps students and researchers master the logic of common ancestry, homology, and character evolution through an intuitive, visual interface.

## 🔬 Core Concepts

Understanding biological relationships requires more than looking at "who is next to whom." CladeX focuses on the fundamental pillars of **Phylogenetic Systematics**:

- **Clade Classification**: Distinguish between monophyletic (true clades), paraphyletic, and polyphyletic groups.
- **Homology Patterns**: Identify and locate Synapomorphies (shared derived traits), Autapomorphies, and Symplesiomorphies.
- **Tree-Thinking Exercises**: Solve challenges involving character placement, leaf identification based on taxonomic hints, and MRCA (Most Recent Common Ancestor) detection.
- **Dynamic Visualization**: Explore trees with organic "pulse" animations and high-fidelity D3-powered renderings.

## 🛠️ Features

- **Interactive Training**: Modules centered on specific taxonomic groups (e.g., Annelida, Chordata) with randomized exercise generation.
- **PhyloPic Integration**: Automatic retrieval and caching of biological silhouettes to provide visual context for every taxon.
- **Newick Parser**: Support for standard Newick format for importing custom evolutionary trees.
- **Visual Feedback**: Real-time validation of answers with detailed evolutionary explanations and highlighted branch paths.
- **Responsive UI**: A modern interface built with Tailwind CSS 4, featuring dark/light modes and fluid animations.

## 🏗️ Technical Workbench

CladeX is a high-performance React application designed for the modern web:

- **Frontend**: React 19 + TypeScript 5
- **Visualization**: D3.js for tree layout and SVG path calculations.
- **State Management**: Zustand for efficient session tracking and XP progress.
- **Styling**: Tailwind CSS + Lucide Icons.
- **Build System**: Vite for ultra-fast development and deployment.

## 🚀 Getting Started

### Development

1. Clone the repository:
   ```bash
   git clone https://github.com/wilsonfrantine/cladex.git
   cd cladex
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

### Content Curation

To update taxonomic icons from the PhyloPic API:
```bash
npm run curate-phylopic
```

---

Developed by **Wilson Frantine** (wilsonfrantine@gmail.com).
More resources at [wilsonfrantine.github.io](https://wilsonfrantine.github.io).
