const pet = {
    environmentData: {
        temperature: null,
        humidity: null,
        light: null,
    },
    health: {
        hunger: 50,
        thirst: 50,
    },
    status: "healthy",
};

// Nueva función para actualizar datos en memoria y en MongoDB
async function updatePetEnvironmentData(newData, db) {
    // Actualiza los datos de la mascota en memoria
    pet.environmentData.temperature = newData.temperature;
    pet.environmentData.humidity = newData.humidity;
    pet.environmentData.light = newData.light;

    // Llama a la función para actualizar el estado de salud
    updateHealthStatus();

    // Guarda los nuevos datos en MongoDB
    await updateEnvironmentData(newData, db);
}

// Función para guardar datos en MongoDB
async function updateEnvironmentData(newData, db) {
    try {
        const result = await db.collection('entorno').insertOne(newData);
        console.log('Datos guardados en MongoDB:', result.insertedId);
    } catch (err) {
        console.error('Error al guardar datos en MongoDB:', err);
    }
}

// Función para actualizar el estado de salud de la mascota
function updateHealthStatus() {
    const { temperature, humidity, light } = pet.environmentData;
    if (temperature < 20 || temperature > 30 || humidity < 30 || light < 50) {
        pet.status = "sick";
    } else {
        pet.status = "healthy";
    }
}

// Función para alimentar a la mascota
function feedPet() {
    if (pet.health.hunger < 100) {
        pet.health.hunger += 10;
    }
}

// Función para dar agua a la mascota
function waterPet() {
    if (pet.health.thirst < 100) {
        pet.health.thirst += 10;
    }
}

module.exports = {
    pet,
    updatePetEnvironmentData, // Exportar la nueva función
    feedPet,
    waterPet,
};