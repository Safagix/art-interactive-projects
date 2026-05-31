extends Node

# StarlightNetwork.gd - UDP Bridge for Eira Vision
# Receives hand landmarks and gesture data

const UDP_PORT = 4242
var server := PacketPeerUDP.new()
var hand_data: Dictionary = {}

signal hand_updated(data)

func _ready():
	if server.bind(UDP_PORT) != OK:
		printerr("❌ StarlightNetwork: Failed to bind to port ", UDP_PORT)
	else:
		print("📡 StarlightNetwork: Bound to Eira on port ", UDP_PORT)

func _process(_delta):
	while server.get_available_packet_count() > 0:
		var packet = server.get_packet().get_string_from_utf8()
		var json = JSON.parse_string(packet)
		if json and json is Dictionary:
			hand_data = json
			# ERROR PROOFING: Ensure keys exist
			if not hand_data.has("gesture"): hand_data["gesture"] = "None"
			emit_signal("hand_updated", hand_data)
