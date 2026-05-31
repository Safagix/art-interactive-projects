extends Node

# StarlightVision.gd - Passthrough Receiver for Godot
# Decodes JPEG frames from UDP and displays them as background

const UDP_PORT = 4243
var server := PacketPeerUDP.new()

@export var display_mesh: MeshInstance3D # Assign the MeshInstance3D (PassthroughPlane)

var persistent_texture: ImageTexture
var packets_received = 0
var last_packet_time = 0.0

func _ready():
	print("=== STARLIGHT VISION STARTUP ===")
	
	# Auto-link if missing in Inspector
	if not display_mesh:
		display_mesh = get_parent().find_child("PassthroughPlane")
		if display_mesh:
			print("✅ StarlightVision: Auto-linked to ", display_mesh.name)
		else:
			printerr("❌ StarlightVision: PassthroughPlane NOT FOUND in scene tree!")
			return
	
	print("📐 PassthroughPlane Transform: ", display_mesh.global_transform)
	print("📦 PassthroughPlane Mesh: ", display_mesh.mesh)
	
	if server.bind(UDP_PORT) != OK:
		printerr("❌ StarlightVision: Failed to bind to port ", UDP_PORT)
	else:
		print("📡 StarlightVision: LISTENING on UDP port ", UDP_PORT)
		print("⏳ Waiting for video packets from PC...")

func _process(_delta):
	if not display_mesh: return
	
	var packet_count = server.get_available_packet_count()
	
	if packet_count > 0 and Time.get_ticks_msec() - last_packet_time > 1000:
		print("📥 Packets in queue: ", packet_count)
		last_packet_time = Time.get_ticks_msec()
	
	while server.get_available_packet_count() > 0:
		var packet = server.get_packet()
		packets_received += 1
		
		if packets_received % 30 == 1:
			print("📦 Packet #", packets_received, " Size: ", packet.size(), " bytes")
		
		var image = Image.new()
		var error = image.load_jpg_from_buffer(packet)
		
		if error == OK:
			# Optimized Texture Management
			if not persistent_texture or Vector2i(persistent_texture.get_size()) != image.get_size():
				persistent_texture = ImageTexture.create_from_image(image)
				print("🎨 Created NEW texture: ", image.get_width(), "x", image.get_height())
			else:
				persistent_texture.update(image)
			
			if packets_received % 60 == 1:
				print("📸 VIDEO ACTIVE - ", image.get_width(), "x", image.get_height())
			
			var material = display_mesh.get_surface_override_material(0)
			if not material:
				material = display_mesh.mesh.surface_get_material(0)
			
			if not material:
				material = StandardMaterial3D.new()
				display_mesh.set_surface_override_material(0, material)
				print("⚠️ Created FALLBACK StandardMaterial3D")
			
			if material is ShaderMaterial:
				material.set_shader_parameter("passthrough_tex", persistent_texture)
				# Attempt to force double-sided if possible, though ShaderMaterial needs 'cull_disabled' in code
				if packets_received % 60 == 1:
					print("🔵 Updated ShaderMaterial texture parameter")
			elif material is StandardMaterial3D:
				material.albedo_texture = persistent_texture
				material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
				material.cull_mode = BaseMaterial3D.CULL_DISABLED
				if packets_received % 60 == 1:
					print("🟢 Updated StandardMaterial3D albedo_texture")
		else:
			if packets_received % 30 == 0:
				printerr("❌ JPEG ERROR Code: ", error, " | Packet Size: ", packet.size())
