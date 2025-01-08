export const shader: string = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;
uniform vec2 u_resolution;

// Point Light Uniforms
uniform float uPointLightPositions[100];
uniform float uPointLightIntensities[50];
uniform float uPointLightFalloffs[50];
uniform float uPointLightColors[150];
uniform int uPointLightCount;

// Ambient Light Uniforms
uniform float uAmbientLightPositions[100];
uniform float uAmbientLightColors[150];
uniform float uAmbientLightIntensities[50];
uniform int uAmbientLightCount;

const float EPSILON = 0.001; // Global EPSILON in UV space

// Textures
uniform sampler2D u_image; 
uniform sampler2D uOccluderMask0;
uniform sampler2D uOccluderMask1;
uniform sampler2D uOccluderMask2;
uniform sampler2D uOccluderMask3;
uniform sampler2D uOccluderMask4;
uniform sampler2D uOccluderMask5;
uniform sampler2D uOccluderMask6;
uniform sampler2D uOccluderMask7;
uniform sampler2D uOccluderMask8;
uniform sampler2D uOccluderMask9;
uniform sampler2D uOccluderMask10;
uniform sampler2D uOccluderMask11;
uniform sampler2D uOccluderMask12;
uniform sampler2D uOccluderMask13;
uniform sampler2D uOccluderMask14;

// Occlusion Shader Uniforms
uniform float uOccluderPosition[100];
uniform float uOccluderSize[100];
uniform float uOccluderAngle[50];
uniform int uOccluderCount;
uniform int uMyOcclusionTextureAssignments[50];

// Structure to represent an occluder
struct Occluder {
    vec2 position;
    vec2 size;
    float rotation;
};

// Structure to represent a PointLight
struct PointLight {
    vec2 position;
    float intensity;
    float falloff;
    vec3 color;
};

// Structure to represent an AmbientLight
struct AmbientLight {
    vec3 color;
    float intensity;
    vec2 position;
};

float calculateShadow(vec2 point, vec2 lightPos, Occluder occluder, int samplerIndex) {

    vec2 lightToPoint = point - lightPos;
    float rayLength = length(lightToPoint);
    vec2 rayDir = normalize(lightToPoint);
    int maskIndex = uMyOcclusionTextureAssignments[samplerIndex];
    
    float shadow = 1.0;
    const int MAX_STEPS = 64;  // Increased for better accuracy
    float stepSize = 1.0;      // Fixed step size in pixels
    
    vec2 currentPos = lightPos;
    float distanceTraveled = 0.0;
    
    // Continue marching until we reach the end point
    while(distanceTraveled < rayLength) {
        // Check if the current position intersects with occluder bounds
        vec2 relativePos = currentPos - occluder.position;
        vec2 normalizedPos = relativePos / occluder.size;
        
        // If we're inside the occluder bounds
        if (normalizedPos.x >= 0.0 && normalizedPos.x <= 1.0 && 
            normalizedPos.y >= 0.0 && normalizedPos.y <= 1.0) {
            
            vec4 occlusionSample;
            
            if(maskIndex == 0) {occlusionSample = texture(uOccluderMask0, normalizedPos);}
            else if(maskIndex == 1) {occlusionSample = texture(uOccluderMask1, normalizedPos);}
            else if(maskIndex == 2) {occlusionSample = texture(uOccluderMask2, normalizedPos);}
            else if(maskIndex == 3) {occlusionSample = texture(uOccluderMask3, normalizedPos);}
            else if(maskIndex == 4) {occlusionSample = texture(uOccluderMask4, normalizedPos);}
            else if(maskIndex == 5) {occlusionSample = texture(uOccluderMask5, normalizedPos);}
            else if(maskIndex == 6) {occlusionSample = texture(uOccluderMask6, normalizedPos);}            
            else if(maskIndex == 7) {occlusionSample = texture(uOccluderMask7, normalizedPos);}
            else if(maskIndex == 8) {occlusionSample = texture(uOccluderMask8, normalizedPos);}
            else if(maskIndex == 9) {occlusionSample = texture(uOccluderMask9, normalizedPos);}
            else if(maskIndex == 10) {occlusionSample = texture(uOccluderMask10, normalizedPos);}
            else if(maskIndex == 11) {occlusionSample = texture(uOccluderMask11, normalizedPos);}
            else if(maskIndex == 12) {occlusionSample = texture(uOccluderMask12, normalizedPos);}
            else if(maskIndex == 13) {occlusionSample = texture(uOccluderMask13, normalizedPos);}
            else if(maskIndex == 14) {occlusionSample = texture(uOccluderMask14, normalizedPos);}
            
            // If we hit an occluder, cast shadow along the remaining ray
            if (occlusionSample.r < 0.5) {
                shadow = 0.0;
                break;
            }
        }
        
        // March forward along the ray
        currentPos += rayDir * stepSize;
        distanceTraveled = length(currentPos - lightPos);
    }
    
    return shadow;
}

vec2 convertFlat2Vec2(float[100] list, int index ){
    return vec2(float(list[index * 2]), float(list[index * 2 + 1]));
}

vec3 convertFlat2Vec3(float[150] list, int index){
    return vec3(float(list[index * 3]), float(list[index * 3 + 1]), float(list[index * 3 + 2]));
}


void main() {
    vec2 pixelCoord = v_uv * u_resolution;
    vec3 totalLight = vec3(0.0);
    float shadow = 1.0;

    // Process point lights
    for(int i = 0; i < uPointLightCount; i++) {
        PointLight light;
        light.position = convertFlat2Vec2(uPointLightPositions, i);
        light.intensity = uPointLightIntensities[i];
        light.falloff = uPointLightFalloffs[i];
        light.color = convertFlat2Vec3(uPointLightColors, i);
        
        float  combinedShadow = 1.0;
        
        // Calculate shadows from all occluders for this light
        for(int j = 0; j < uOccluderCount; j++) {
            Occluder occluder;
            occluder.position = convertFlat2Vec2(uOccluderPosition, j);
            occluder.size = convertFlat2Vec2(uOccluderSize, j);
            occluder.rotation = uOccluderAngle[j];
            
            
            float shadow = calculateShadow(pixelCoord, light.position, occluder, j);
            combinedShadow *= shadow; // Multiply shadows together for overlapping occluders
        }
        
        // Calculate point light contribution
        float distance = length(pixelCoord - light.position);
        float falloff = 1.0 / (1.0 + distance * light.falloff);
        vec3 pointLightContribution = light.color * falloff * combinedShadow * light.intensity;
        
        totalLight += pointLightContribution;
    }

    // Process ambient lights
    for(int i = 0; i < uAmbientLightCount; i++) {
        AmbientLight ambient;
        ambient.position = convertFlat2Vec2(uAmbientLightPositions, i);
        ambient.color = convertFlat2Vec3(uAmbientLightColors, i);
        ambient.intensity = uAmbientLightIntensities[i];
        
        // Simple ambient contribution - could be modified to have falloff or other effects
        totalLight += ambient.color * ambient.intensity;
    }
           
    vec4 textureColor = texture(u_image, v_uv);
    
    // Final color calculation
    vec3 finalColor = min(totalLight * textureColor.rgb, vec3(1.0));
    
    //fragColor = vec4(finalColor, textureColor.a);
    fragColor = texture(uOccluderMask1, v_uv);
}`;
