const carModels = [
  "Audi A4 Premium", "BMW 3 Series", "Mercedes-Benz C300", "Porsche 718 Cayman", "Tesla Model 3",
  "Lexus IS 350", "Jaguar XE", "Volvo S60", "Alfa Romeo Giulia", "Maserati Ghibli",
  "Audi R8", "BMW M4", "Mercedes-AMG GT", "Chevrolet Corvette", "Nissan GT-R",
  "Honda Civic Type R", "Volkswagen Golf R", "Ford Mustang GT", "Dodge Challenger", "Toyota Supra"
];

const motoModels = [
  "Kawasaki Ninja ZX-6R", "Ducati Panigale V4", "BMW S1000RR", "Harley-Davidson Iron 883", "Yamaha R1",
  "Honda CBR1000RR-R", "Suzuki GSX-R1000", "Aprilia RSV4", "Triumph Daytona 765", "KTM RC 8C",
  "MV Agusta F4", "Indian Scout Bobber", "Royal Enfield Continental GT", "Ducati Monster", "Kawasaki Z900",
  "Yamaha MT-09", "Honda CB1000R", "Triumph Street Triple", "BMW R nineT", "Suzuki Katana"
];

const generateVehicles = () => {
  const list = [];
  
  // Cars
  carModels.forEach((model, i) => {
    list.push({
      id: i + 1,
      type: 'car',
      model: model,
      year: 2020 + (i % 5),
      mileage: `${(i + 1) * 3000} km`,
      engine: i % 2 === 0 ? '2.0L Turbo' : '3.0L V6',
      price: `$${(25 + i * 5)},000`,
      mainImage: './car.png',
      gallery: ['./car.png', './car_int.png'],
      description: `Un espectacular ${model} que redefine el lujo y la potencia. En perfectas condiciones.`,
      new: i < 5,
      createdAt: new Date().toISOString(),
      recentDuration: 30
    });
  });

  // Motos
  motoModels.forEach((model, i) => {
    list.push({
      id: carModels.length + i + 1,
      type: 'motorcycle',
      model: model,
      year: 2021 + (i % 4),
      mileage: `${(i + 1) * 500} km`,
      engine: `${600 + i * 50}cc`,
      price: `$${(8 + i * 2)},500`,
      mainImage: './moto.png',
      gallery: ['./moto.png', './moto_detail.png'],
      description: `Siente la adrenalina pura con esta ${model}. Ingeniería de competición para la calle.`,
      new: i < 5,
      createdAt: new Date().toISOString(),
      recentDuration: 30
    });
  });

  return list;
};

// Global initial data
window.initialVehicles = generateVehicles();
