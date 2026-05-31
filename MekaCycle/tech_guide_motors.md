# Tech Guide: Identifying & Testing Salvaged Motors

Motors are the muscles of your robot. Here's how to know what you've found.

## 1. DC Motors (2 Wires)

- **Found in**: Toys, fans, cheap printers, CD spin motors.
- **Identification**: Only 2 wires (Red/Black or Plain).
- **Testing**: Connect to a battery (3V - 9V). If it spins, it's good! Reverse wires to reverse direction.
- **MekaCycle Pro Tip**: If it has a worm gear, it's a high-torque goldmine for robotic arms.

## 2. Stepper Motors (4, 5, or 6 Wires)

- **Found in**: Printers, Scanners, Floppy drives.
- **Identification**: Flat or square shape. Does NOT spin freely by hand (you feel "steps").
- **Testing**: You cannot test these with just a battery. You need a **Stepper Driver** (A4988 or ULN2003).
- **MekaCycle Pro Tip**: Use a multimeter in Continuity mode. Find the pairs of wires that "beep" together. Those are your coils.

## 3. Brushless Motors (BLDC)

- **Found in**: Hard drives, PC cooling fans, High-end drones.
- **Identification**: Usually 3 heavy wires or 4+ thin wires (sensors).
- **Testing**: Requires an **ESC** (Electronic Speed Controller).
- **MekaCycle Pro Tip**: Hard drive motors are incredibly fast but have low torque. Great for spinning mirrors or light shows.

## 4. Vibration Motors

- **Found in**: Cellphones, Game controllers.
- **Identification**: Tiny "button" or a standard motor with an offset weight.
- **Testing**: 1.5V to 3V is usually enough to make them buzz.
