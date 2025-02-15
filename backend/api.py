from fastapi import FastAPI
import torch
from train_model import DQN

app = FastAPI()

# Load the trained model
state_size = 2  # Same as in training
action_size = 3
model = DQN(state_size, action_size)
model.load_state_dict(torch.load("models/traffic_rl_model.pth"))
model.eval()

@app.get("/predict")
def predict(state: str):
    state_array = list(map(float, state.split(",")))
    with torch.no_grad():
        action = torch.argmax(model(torch.tensor([state_array], dtype=torch.float32))).item()
    return {"action": action}
