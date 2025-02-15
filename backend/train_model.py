import torch
import torch.nn as nn
import torch.optim as optim
import random
import numpy as np
from collections import deque
from traffic_env import TrafficSignalEnv

# Define Deep Q-Network (DQN)
class DQN(nn.Module):
    def __init__(self, state_size, action_size):
        super(DQN, self).__init__()
        self.fc1 = nn.Linear(state_size, 24)
        self.fc2 = nn.Linear(24, 24)
        self.fc3 = nn.Linear(24, action_size)

    def forward(self, x):
        x = torch.relu(self.fc1(x))
        x = torch.relu(self.fc2(x))
        return self.fc3(x)

# Define DQN Agent
class TrafficRLAgent:
    def __init__(self, state_size, action_size):
        self.state_size = state_size
        self.action_size = action_size
        self.memory = deque(maxlen=2000)
        self.gamma = 0.95  # Discount factor
        self.epsilon = 1.0  # Exploration rate
        self.epsilon_min = 0.01
        self.epsilon_decay = 0.995
        self.learning_rate = 0.001
        self.model = DQN(state_size, action_size)
        self.optimizer = optim.Adam(self.model.parameters(), lr=self.learning_rate)

    def remember(self, state, action, reward, next_state, done):
        self.memory.append((state, action, reward, next_state, done))

    def act(self, state):
        if np.random.rand() <= self.epsilon:
            return random.randrange(self.action_size)  # Random action (exploration)
        state_tensor = torch.tensor(state, dtype=torch.float32).unsqueeze(0)
        with torch.no_grad():
            return torch.argmax(self.model(state_tensor)).item()  # Select best action (exploitation)

    def train(self, batch_size=32):
        if len(self.memory) < batch_size:
            return
        batch = random.sample(self.memory, batch_size)

        for state, action, reward, next_state, done in batch:
            target = reward
            if not done:
                with torch.no_grad():
                    target += self.gamma * torch.max(self.model(torch.tensor(next_state, dtype=torch.float32))).item()

            prediction = self.model(torch.tensor(state, dtype=torch.float32))
            loss = nn.functional.mse_loss(prediction[action], torch.tensor(target))

            self.optimizer.zero_grad()
            loss.backward()
            self.optimizer.step()

# Initialize Environment and Agent
env = TrafficSignalEnv()
state_size = env.observation_space.shape[0]
action_size = env.action_space.n
agent = TrafficRLAgent(state_size, action_size)

# Train the Model
for episode in range(200):
    state = env.reset()
    total_reward = 0

    for step in range(50):
        action = agent.act(state)
        next_state, reward, done, _ = env.step(action)
        agent.remember(state, action, reward, next_state, done)

        state = next_state
        total_reward += reward

        if done:
            break

    agent.train()
    agent.epsilon = max(agent.epsilon_min, agent.epsilon * agent.epsilon_decay)
    print(f"Episode {episode}, Total Reward: {total_reward}")

# Save Trained Model
torch.save(agent.model.state_dict(), "models/traffic_rl_model.pth")
print("Model saved successfully in models/traffic_rl_model.pth")

env.close()
