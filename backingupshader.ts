export const shader: string = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;
uniform vec2 u_resolution;
uniform float uRayStepSize;

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
uniform float uOccluderPositions[100];
uniform float uOccluderSizes[100];
uniform float uOccluderAngles[50];
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

// Helper function for rotation
mat2 rotate2D(float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return mat2(c, -s, s, c);
}

float calculateShadow(vec2 point, vec2 lightPos, Occluder occluder, int samplerIndex) {

    vec2 lightToPoint = point - lightPos;
    float rayLength = length(lightToPoint);
    vec2 rayDir = normalize(lightToPoint);
    int maskIndex = uMyOcclusionTextureAssignments[samplerIndex];
    
    float shadow = 1.0;
    float stepSize = uRayStepSize;      // Fixed step size in pixels
        
    vec2 currentPos = lightPos;
    float distanceTraveled = 0.0;
    
    // Continue marching until we reach the end point
    while(distanceTraveled < rayLength) {
        // Check if the current position intersects with occluder bounds
        vec2 relativePos = currentPos - occluder.position;

        // Rotate the relative position of the point to the occluder's local space
        vec2 rotatedRelativePos = rotate2D(occluder.rotation) * relativePos; 

        // Calculate normalized position in occluder's local space
        vec2 normalizedPos = rotatedRelativePos / occluder.size;

        //vec2 normalizedPos = relativePos / occluder.size; <--old code
        vec2 flippedUv = vec2(normalizedPos.x, 1.0 - normalizedPos.y);
        
        // If we're inside the occluder bounds
        if (normalizedPos.x >= 0.0 && normalizedPos.x <= 1.0 && 
            normalizedPos.y >= 0.0 && normalizedPos.y <= 1.0) {
            
            vec4 occlusionSample;
            
            if(maskIndex == 0) {occlusionSample = texture(uOccluderMask0, flippedUv);}
            else if(maskIndex == 1) {occlusionSample = texture(uOccluderMask1, flippedUv);}
            else if(maskIndex == 2) {occlusionSample = texture(uOccluderMask2, flippedUv);}
            else if(maskIndex == 3) {occlusionSample = texture(uOccluderMask3, flippedUv);}
            else if(maskIndex == 4) {occlusionSample = texture(uOccluderMask4, flippedUv);}
            else if(maskIndex == 5) {occlusionSample = texture(uOccluderMask5, flippedUv);}
            else if(maskIndex == 6) {occlusionSample = texture(uOccluderMask6, flippedUv);}            
            else if(maskIndex == 7) {occlusionSample = texture(uOccluderMask7, flippedUv);}
            else if(maskIndex == 8) {occlusionSample = texture(uOccluderMask8, flippedUv);}
            else if(maskIndex == 9) {occlusionSample = texture(uOccluderMask9, flippedUv);}
            else if(maskIndex == 10) {occlusionSample = texture(uOccluderMask10, flippedUv);}
            else if(maskIndex == 11) {occlusionSample = texture(uOccluderMask11, flippedUv);}
            else if(maskIndex == 12) {occlusionSample = texture(uOccluderMask12, flippedUv);}
            else if(maskIndex == 13) {occlusionSample = texture(uOccluderMask13, flippedUv);}
            else if(maskIndex == 14) {occlusionSample = texture(uOccluderMask14, flippedUv);}
            
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
            occluder.position = convertFlat2Vec2(uOccluderPositions, j);
            occluder.size = convertFlat2Vec2(uOccluderSizes, j);
            occluder.rotation = uOccluderAngles[j];
            
            
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
    fragColor = vec4(finalColor, textureColor.a);  
    
}`;
