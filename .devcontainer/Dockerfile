FROM node:22-slim

# Ensure all system packages are up to date to reduce vulnerabilities
RUN apt-get update && apt-get upgrade -y && rm -rf /var/lib/apt/lists/*

# Install dependencies for building native modules and git
RUN apt-get update && apt-get install -y \
    git \
    python3 \
    build-essential \
    curl \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install bun
RUN curl -fsSL https://bun.sh/install | bash && \
    mv /root/.bun/bin/bun /usr/local/bin/bun

# Set working directory
WORKDIR /workspace

# Copy only package manager files first for better layer caching
COPY package.json ./
COPY bun.lockb* ./

# Install dependencies with bun
RUN bun install

# Copy the rest of the project files
COPY . .

# Ensure node_modules/.bin is in PATH
ENV PATH="/workspace/node_modules/.bin:${PATH}"

# Expose default Vite port
EXPOSE 5173

# Set default shell to bash for interactive use
SHELL ["/bin/bash", "-c"]

# Default command (can be overridden in devcontainer.json)
CMD ["bun", "run", "dev", "--host"]