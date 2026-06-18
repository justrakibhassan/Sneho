import prisma from "./src/config/db.js";
import bcrypt from "bcrypt";

const femaleNames = [
  "Sarah Ahmed", "Maria Islam", "Nadia Rahman", "Emily Das", "Anika Tabassum",
  "Samantha Pervez", "Tanjiha Akter", "Raisa Maliha", "Farhana Chowdhury", "Tasnim Jahan",
  "Zareen Tasneem", "Humaira Kabir", "Sabiba Hossain", "Nusrat Jahan", "Ishrat Maleque",
  "Jannatul Ferdous", "Nafisa Ali", "Sumaiya Karim", "Lamia Hassan", "Sadia Afrin"
];

const bios = [
  "I am a passionate caregiver with over 5 years of experience in early childhood education. I love creating engaging and educational activities for children of all ages.",
  "Hello! I am a university student looking to help families with childcare. I am responsible, patient, and love animals. I can also help with elementary school homework.",
  "Expert in infant care and toddler development. I believe in positive reinforcement and creating a safe, nurturing environment for your little ones.",
  "Creative and energetic sitter who loves storytelling and arts & crafts. I have my own transportation and am CPR/First Aid certified.",
  "Experienced in managing multiple children and handling special needs. I am patient, calm under pressure, and very dependable.",
  "I have a background in nursing and specialized training in newborn care. Safety and health are my top priorities while keeping kids entertained.",
  "Fun-loving babysitter who enjoys outdoor activities and sports. I aim to keep children active and away from screens.",
  "Bilingual sitter (English & Bengali) with a focus on educational play. I can help your child with language development while having fun.",
  "I have been babysitting since I was 16 and genuinely love working with kids. I'm punctual, reliable, and a great cook!",
  "Dedicated childcare professional with a MONTESSORI certification. I focus on child-led learning and independence.",
  "Art enthusiast and music lover. I enjoy teaching children how to paint and play basic instruments while their parents are away.",
  "A bubbly personality with a lot of energy. I love playing hide and seek and coming up with creative games for kids.",
  "Professional and soft-spoken. I specialize in evening care and bedtime routines to ensure a peaceful night for your children.",
  "Very experienced with large families. I am organized and can handle meal prep, light housework, and school pickups.",
  "I am a former preschool teacher with a deep understanding of child psychology. I provide structured play and learning sessions.",
  "Lively and creative. I love organizing themed parties and craft sessions for kids. Your children will never be bored with me!",
  "Reliable and calm. I have extensive experience with twins and triplets. I am very methodical and attentive to details.",
  "Nature lover who enjoys taking kids to the park and teaching them about plants and animals. I prioritize outdoor play.",
  "Tech-savvy but screen-time conscious. I can help older kids with coding or maths while keeping younger ones engaged with toys.",
  "I treat every child with the same care and respect as if they were my own family. Warm, loving, and extremely patient."
];

const skillTags = [
  "CPR Certified, First Aid, Storytelling",
  "Homework Help, Creative Arts, Cooking",
  "Infant Care, Toddler Development, Punctual",
  "Outdoor Games, Sports, Active Play",
  "Special Needs Support, Patient, Dependable",
  "Newborn Care, Health Focus, Nursing background",
  "Bilingual, Language Development, Educational Play",
  "Meal Prep, Light Housework, School Pickups",
  "Preschool Teaching, Montessori, Structured Play",
  "Art & Crafts, Music, Painting"
];

const portraitIds = [
  "1494790108377-be9c29b29330", "1544005313-94ddf0286df2", "1506794778202-cd50b00b5d93",
  "1438761681033-6461ffad8d80", "1534567153574-06d27f71be4a", "1517841905240-472988babdf9",
  "1507003211169-0a1dd7228f2d", "1531123897727-89856e437142", "1524503033-2a6217287ca6",
  "1488428234225-3004d38f3103", "1509960113263-d5dce2e9c201", "1525134479664-07d526278fad",
  "1531741495079-6a624785f269", "1500648767791-00dcc994a43e", "1508214751196-bcf5fe6105db",
  "1534751516-63c2f107b7c3", "1487412720507-af6737d28983", "1492633423522-d452b128cd30",
  "1529626455594-22569539a6e3", "1534524226848-0d1bc2602e7a"
];

async function seed() {
  const password = "password123";
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log("Seeding professional sitter profiles...");

  for (let i = 0; i < 20; i++) {
    const email = `sitter_test_${i + 1}@sneho.com`;
    const name = femaleNames[i];
    const portraitId = portraitIds[i];
    const profilePicture = `https://images.unsplash.com/photo-${portraitId}?q=80&w=256&h=256&auto=format&fit=crop`;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
        console.log(`Sitter ${i + 1} (${email}) already exists. Skipping.`);
        continue;
    }

    try {
        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                profilePicture,
                role: "BABYSITTER",
                isApproved: true,
                isVerified: true,
                sitterStatus: "APPROVED",
                babysitter: {
                    create: {
                        bio: bios[i],
                        experienceYears: Math.floor(Math.random() * 7) + 2, // 2-8 years
                        hourlyRate: Math.floor(Math.random() * 350) + 250, // 250-600
                        locationAddress: i % 2 === 0 ? "Banani, Dhaka" : "Dhanmondi, Dhaka",
                        averageRating: 4.5 + (Math.random() * 0.5), // 4.5 - 5.0
                        totalRatings: Math.floor(Math.random() * 30) + 5, // 5-35 reviews
                        gender: "Female",
                        skills: skillTags[i % skillTags.length],
                        isApproved: true
                    }
                }
            }
        });
        console.log(`Sitter ${i + 1} (${name}) created.`);
    } catch (error) {
        console.error(`Error creating sitter ${i + 1}:`, error);
    }
  }

  console.log("Professional seeding completed successfully!");
}

seed()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
