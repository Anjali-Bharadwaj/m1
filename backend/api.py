import numpy as np
import gym
from gym import spaces

class TrafficSignalEnv(gym.Env):
    def __init__(self):
        super(TrafficSignalEnv, self).__init__()
        
        # Define action space (e.g., 3 traffic light phases)
        self.action_space = spaces.Discrete(3)
        
        # Define state space (e.g., queue lengths at an intersection)
        self.observation_space = spaces.Box(low=0, high=10, shape=(4,), dtype=np.float32)
        
        self.state = np.random.randint(0, 10, size=(4,), dtype=np.float32)
        self.step_count = 0
    
    def step(self, action):
        self.step_count += 1
        
        # Simulate traffic flow impact based on action
        reward = -np.sum(self.state)  # Lower queue length = better reward
        
        self.state = np.clip(self.state - np.random.randint(1, 4, size=(4,)), 0, 10)
        done = self.step_count >= 50  # Episode ends after 50 steps
        
        return self.state, reward, done, {}
    
    def reset(self):
        self.state = np.random.randint(0, 10, size=(4,), dtype=np.float32)
        self.step_count = 0
        return self.state
    
    def render(self, mode='human'):
        print(f"Step {self.step_count}: State = {self.state}")
