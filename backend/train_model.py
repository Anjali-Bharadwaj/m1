import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
from tensorflow.keras.optimizers import Adam
import random
from collections import deque
from traffic_env import TrafficSignalEnv  # Updated environment (without SUMO)

# Hyperparameters
STATE_SIZE = 5   # Example state size (adjust based on your environment)
ACTION_SIZE = 2  # Example actions: (0 = keep current light, 1 = change light)
GAMMA = 0.95     # Discount factor
LEARNING_RATE = 0.001
BATCH_SIZE = 16  # Reduce from 32 to 16

MEMORY_SIZE = 2000
EPISODES = 1000

# DQN Agent
class DQNAgent:
    def __init__(self, state_size, action_size):
        self.state_size = state_size
        self.action_size = action_size
        self.memory = deque(maxlen=MEMORY_SIZE)
        self.model = self._build_model()
    
    def _build_model(self):
        model = Sequential([
            Dense(24, input_dim=self.state_size, activation="relu"),
            Dense(24, activation="relu"),
            Dense(self.action_size, activation="linear")  # Output: Q-values for each action
        ])
        model.compile(loss="mse", optimizer=Adam(learning_rate=LEARNING_RATE))
        return model
    
    def remember(self, state, action, reward, next_state, done):
        self.memory.append((state, action, reward, next_state, done))

    def act(self, state, epsilon):
        if np.random.rand() <= epsilon:
            return random.randrange(self.action_size)  # Explore: Random action
        q_values = self.model.predict(state, verbose=0)
        return np.argmax(q_values[0])  # Exploit: Best action
    
    def replay(self):
        if len(self.memory) < BATCH_SIZE:
            return
        minibatch = random.sample(self.memory, BATCH_SIZE)
        for state, action, reward, next_state, done in minibatch:
            target = reward
            if not done:
                target += GAMMA * np.amax(self.model.predict(next_state, verbose=0)[0])
            target_f = self.model.predict(state, verbose=0)
            target_f[0][action] = target
            self.model.fit(state, target_f, epochs=1, verbose=0)

# Train the Model
env = TrafficSignalEnv()  # Custom environment
agent = DQNAgent(STATE_SIZE, ACTION_SIZE)

for episode in range(EPISODES):
    state = env.reset()
    state = np.reshape(state, [1, STATE_SIZE])
    total_reward = 0
    done = False
    
    while not done:
        action = agent.act(state, epsilon=0.1)  # Epsilon-greedy policy
        next_state, reward, done = env.step(action)
        next_state = np.reshape(next_state, [1, STATE_SIZE])
        
        agent.remember(state, action, reward, next_state, done)
        state = next_state
        total_reward += reward
    
    agent.replay()
    
    print(f"Episode {episode+1}/{EPISODES}, Reward: {total_reward}")

# Save the trained model
agent.model.save("backend/dqn_model.h5")
print("Training complete. Model saved as dqn_model.h5")
