import numpy as np
import random

class TrafficSignalEnv:
    def __init__(self):
        # Define environment parameters
        self.state_size = 5  # Example: [traffic density, wait time, signal state, etc.]
        self.action_size = 2  # Actions: 0 = keep current signal, 1 = change signal
        self.state = np.random.rand(self.state_size)  # Initialize random state
        self.time_step = 0
        self.max_steps = 100  # Max steps per episode

    def reset(self):
        """ Reset the environment at the beginning of each episode """
        self.state = np.random.rand(self.state_size)  # Reset state
        self.time_step = 0
        return self.state

    def step(self, action):
        """
        Take an action in the environment.

        :param action: 0 (keep signal) or 1 (change signal)
        :return: next_state, reward, done
        """
        self.time_step += 1
        reward = self._calculate_reward(action)
        self.state = np.random.rand(self.state_size)  # Update state randomly for simplicity
        done = self.time_step >= self.max_steps  # Stop when max steps reached
        return self.state, reward, done

    def _calculate_reward(self, action):
        """
        Reward function: Encourage efficient traffic management.
        """
        if action == 0:
            reward = random.uniform(0, 1)  # Example reward for keeping signal
        else:
            reward = random.uniform(-1, 1)  # Example penalty for changing signal randomly
        return reward
