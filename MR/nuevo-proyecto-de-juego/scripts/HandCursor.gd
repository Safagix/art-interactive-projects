extends MeshInstance3D

## HandCursor.gd - Spatial Mapping for Eira HUD
## Translates 2D MediaPipe landmarks to 3D Godot space

@export var smoothing: float = 0.4
@export var depth_factor: float = 5.0
@export var landmark_index: int = 8 # Index Finger

func _on_starlight_network_hand_updated(data):
	# DATA STRUCTURE: {x, y, z, gesture, score}
	if data.get("gesture") != "None":
		# 1. READ NORMALIZED COORDINATES (0.0 - 1.0)
		var lx = data.get("x", 0.5)
		var ly = data.get("y", 0.5)
		var lz = data.get("z", 0.5)
		
		# 2. MAP TO GODOT 3D SPACE (Based on Screen Scale)
		# Center (0.5, 0.5) -> (0, 0)
		var target_x = (lx - 0.5) * 11.6
		var target_y = - (ly - 0.5) * 6.5
		
		# 3. DEPTH MAPPING
		# Python sends Z: 0.0 (Close) to 1.0 (Far)
		# We map this to Godot Z: -2.0 (Close) to -6.0 (Far)
		var target_z = -2.0 + (lz * -4.0)
		
		var target_pos = Vector3(target_x, target_y, target_z)
		global_position = global_position.lerp(target_pos, smoothing)
		
		# 4. VISUAL FEEDBACK
		var mat = get_surface_override_material(0)
		if mat:
			if data["gesture"] == "Closed_Fist":
				mat.albedo_color = Color(1, 0, 0, 1) # Red = Grab
			elif data["gesture"] == "Open_Palm":
				mat.albedo_color = Color(0, 1, 0, 1) # Green = Idle
			else:
				mat.albedo_color = Color(0, 1, 1, 1) # Cyan = Unknown
