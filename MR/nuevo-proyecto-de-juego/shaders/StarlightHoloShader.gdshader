shader_type spatial;
render_mode blend_add, unshaded, shadows_disabled, cull_disabled;

// StarlightHoloShader.gdshader
// High-tech HUD effect with Fresnel glow and Scanlines

uniform vec4 holo_color : source_color = vec4(0.0, 1.0, 1.0, 0.6);
uniform sampler2D passthrough_tex : source_color;
uniform float pulse_speed : hint_range(0.0, 10.0) = 2.0;
uniform float scanline_density : hint_range(0.0, 1000.0) = 50.0;
uniform float fresnel_power : hint_range(1.0, 10.0) = 3.0;

void fragment() {
    // 1. Pulsing Intensity
    float pulse = (sin(TIME * pulse_speed) * 0.15) + 0.85;
    
    // 2. Fresnel Border Glow
    float fresnel = pow(1.0 - dot(NORMAL, VIEW), fresnel_power);
    
    // 3. Scanline Pattern
    float scanline = step(0.6, (sin(FRAGCOORD.y * (1.0 / VIEWPORT_SIZE.y) * scanline_density)));
    
    // 4. Combine
    float alpha = (fresnel + 0.2 + (scanline * 0.15)) * holo_color.a * pulse;
    
    // 5. Video Mix (Primary visibility)
    vec4 tex_color = texture(passthrough_tex, UV);
    
    // Mix: 80% video, 20% hologram color
    vec3 final_color = mix(tex_color.rgb, holo_color.rgb, 0.2);
    
    // Add holographic overlay effects
    final_color += (holo_color.rgb * fresnel * 0.5);
    final_color += (holo_color.rgb * scanline * 0.2);
    
    ALBEDO = final_color;
    ALPHA = 1.0; // Full visibility for passthrough
}
