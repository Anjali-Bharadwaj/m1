import os
import traci
import numpy as np
import gym
from gym import spaces

class TrafficSignalEnv(gym.Env):
    def __init__(self):
        super(TrafficSignalEnv, self).__init__()
        sumo_binary = "sumo"  # or "sumo-gui"
        sumo_config = "backend/simulation.sumocfg"

        traci.start([sumo_binary, "-c", sumo_config, "--start"])

        self.action_space = spaces.Discrete(3)  # 3 possible traffic light states
        self.observation_space = spaces.Box(low=0, high=100, shape=(2,), dtype=np.float32)

    def step(self, action):
        traci.trafficlight.setPhase("A", action)
        traci.simulationStep()
        waiting_time = sum(traci.edge.getWaitingTime(edge) for edge in traci.edge.getIDList())
        num_vehicles = sum(traci.edge.getLastStepVehicleNumber(edge) for edge in traci.edge.getIDList())

        reward = -waiting_time + (10 - num_vehicles)
        state = np.array([waiting_time, num_vehicles], dtype=np.float32)
        done = traci.simulation.getMinExpectedNumber() <= 0

        return state, reward, done, {}

    def reset(self):
        traci.load(["-c", "backend/simulation.sumocfg"])
        return np.array([0, 0], dtype=np.float32)

    def close(self):
        traci.close()
