import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting seed...');

    // Create a test user
    const hashedPassword = await bcrypt.hash('password123', 10);

    const user = await prisma.user.upsert({
        where: { email: 'test@example.com' },
        update: {},
        create: {
            email: 'test@example.com',
            name: 'Test User',
            password: hashedPassword,
        },
    });

    console.log('Created test user:', user.email);

    // Create a sample subtitle file
    const subtitleFile = await prisma.subtitleFile.create({
        data: {
            userId: user.id,
            filename: 'sample.srt',
            fileSize: 1024,
        },
    });

    console.log('Created sample file:', subtitleFile.filename);

    // Create sample vocabulary
    const sampleVocabulary = [
        {
            word: '勉強',
            reading: 'べんきょう',
            meaning: 'study',
            contextSentence: '毎日勉強します。',
            frequency: 5,
        },
        {
            word: '日本語',
            reading: 'にほんご',
            meaning: 'Japanese language',
            contextSentence: '日本語を勉強しています。',
            frequency: 8,
        },
        {
            word: '学校',
            reading: 'がっこう',
            meaning: 'school',
            contextSentence: '学校に行きます。',
            frequency: 3,
        },
        {
            word: '先生',
            reading: 'せんせい',
            meaning: 'teacher',
            contextSentence: '先生に質問します。',
            frequency: 4,
        },
        {
            word: '友達',
            reading: 'ともだち',
            meaning: 'friend',
            contextSentence: '友達と遊びます。',
            frequency: 6,
        },
    ];

    for (const vocab of sampleVocabulary) {
        await prisma.vocabulary.create({
            data: {
                fileId: subtitleFile.id,
                ...vocab,
            },
        });
    }

    console.log('Created sample vocabulary');

    console.log('Seed completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

