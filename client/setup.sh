#!/bin/bash
set -e

echo "Modifying components.json..."
sed -i 's/"registries": {}/"registries": {\n    "@21st": "https:\/\/21st.dev\/r\/{name}.json"\n  }/' components.json

echo "Installing shadcn UI components..."
bunx --bun shadcn@latest add button input label card badge avatar tabs dialog sheet dropdown-menu select switch checkbox table calendar popover tooltip skeleton separator scroll-area progress alert alert-dialog toast sonner form textarea -y

echo "Installing 21st.dev components..."
bunx --bun shadcn@latest add "https://21st.dev/r/serafimcloud/file-uploader" -y
bunx --bun shadcn@latest add "https://21st.dev/r/originui/steps" -y
bunx --bun shadcn@latest add "https://21st.dev/r/shadcn-extension/multi-select" -y
bunx --bun shadcn@latest add "https://21st.dev/r/jackblatch/countdown-timer" -y
bunx --bun shadcn@latest add "https://21st.dev/r/bundui/animated-number" -y

echo "Installing npm packages..."
bun add react-router-dom @tanstack/react-query zustand date-fns react-hot-toast react-icons @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

echo "Setup complete!"
