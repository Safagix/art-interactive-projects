# 🧠 Meka-Logic: The Thinking Engine

This guide teaches you how to approach mechatronic problems using the same **Chain-of-Thought (CoT)** architecture that MekaCycle uses.

## The 4-Layer Diagnostic Stack

### Layer 1: Energy Analysis (Follow the Joules)

*Stop and think: Is power actually reaching the target?*

- **Check**: Use a multimeter. Is the voltage sagging under load?
- **Logic**: If V drops when the motor starts, your power supply (or battery) has a high internal resistance. Use a bigger capacitor or a better battery.

### Layer 2: Signal Integrity (The Data Flow)

*Stop and think: Is the "brain" talking to the "muscles"?*

- **Check**: Use a logic probe or Arduino serial plotter.
- **Logic**: Is the PWM duty cycle too low for the motor's starting inertia? Is there electromagnetic interference (EMI) from the motors resetting your MCU?

### Layer 3: Mechanical Load (The Friction War)

*Stop and think: Is physics fighting you?*

- **Check**: Can you turn the shaft by hand? Is there binding or misalignment?
- **Logic**: A motor that "hums" is stalled. A stalled motor is a heating element. Turn it off before the Magic Smoke escapes.

### Layer 1-3 Reflection Matrix

| Symptom | Layer | Probable Culprit |
| :--- | :---: | :--- |
| Motor is hot, not moving | 3 | Mechanical Jam |
| Random MCU Resets | 2 | No Snubber Diode / EMI |
| LED blinks, motor twitches | 1 | Undervoltage / Weak Battery |

---

## 🛠️ Applying CoT to Your Prompt

When you ask MekaCycle for help, use this structure:

1. **Goal**: "I want to move a 30cm arm."
2. **Current State**: "The arm moves but 'stutters'."
3. **Diagnostic Thinking**: "I checked **Layer 1** (12V steady) and **Layer 3** (no friction). I suspect **Layer 2** (code timing)."

*¡Pensar es la primera herramienta de cualquier mecatrónico!*
