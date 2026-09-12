"""Architecture used by the Engine 3 LSTM autoencoder artifact."""
from __future__ import annotations

import torch
from torch import nn


class LSTMAutoencoder(nn.Module):
    def __init__(self, n_feats, seq_len, hidden1=64, hidden2=32):
        super().__init__()
        self.seq_len = seq_len
        self.enc1 = nn.LSTM(n_feats, hidden1, batch_first=True)
        self.enc2 = nn.LSTM(hidden1, hidden2, batch_first=True)
        self.dec1 = nn.LSTM(hidden2, hidden2, batch_first=True)
        self.dec2 = nn.LSTM(hidden2, hidden1, batch_first=True)
        self.out = nn.Linear(hidden1, n_feats)

    def forward(self, x):
        enc1_out, _ = self.enc1(x)
        _, (h2, _) = self.enc2(enc1_out)
        latent = h2[-1]
        latent_rep = latent.unsqueeze(1).repeat(1, self.seq_len, 1)
        dec1_out, _ = self.dec1(latent_rep)
        dec2_out, _ = self.dec2(dec1_out)
        return self.out(dec2_out)
