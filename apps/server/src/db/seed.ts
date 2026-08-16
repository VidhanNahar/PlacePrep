import dotenv from 'dotenv';
dotenv.config();

import { prisma } from './client.js';
import { QUESTION_CATEGORIES_PRESETS } from '@placeprep/shared';
import slugify from 'slugify';

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Seed Question Categories
  console.log('📦 Seeding question categories...');
  const categoryMap = new Map<string, string>();

  for (const cat of QUESTION_CATEGORIES_PRESETS) {
    const created = await prisma.questionCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
      },
    });
    categoryMap.set(cat.slug, created.id);
  }

  // 2. Seed Companies
  console.log('🏢 Seeding top recruiting companies...');
  const companiesData = [
    {
      name: 'Google',
      industry: 'Big Tech / Internet',
      websiteUrl: 'https://careers.google.com',
      logoUrl: 'https://www.google.com/favicon.ico',
      description: 'Global technology leader in search, cloud computing, AI, and hardware.',
    },
    {
      name: 'Microsoft',
      industry: 'Software / Cloud',
      websiteUrl: 'https://careers.microsoft.com',
      logoUrl: 'https://www.microsoft.com/favicon.ico',
      description: 'Pioneering operating systems, Azure cloud, productivity software, and gaming.',
    },
    {
      name: 'Amazon',
      industry: 'E-commerce / Cloud (AWS)',
      websiteUrl: 'https://amazon.jobs',
      logoUrl: 'https://www.amazon.com/favicon.ico',
      description: 'E-commerce giant and cloud services pioneer with Amazon Web Services.',
    },
    {
      name: 'Atlassian',
      industry: 'Enterprise Software',
      websiteUrl: 'https://atlassian.com/careers',
      logoUrl: 'https://wac-cdn.atlassian.com/assets/img/favicons/atlassian/favicon.png',
      description: 'Collaboration software company behind Jira, Confluence, and Bitbucket.',
    },
    {
      name: 'Uber',
      industry: 'Mobility & Logistics',
      websiteUrl: 'https://uber.com/careers',
      logoUrl: 'https://www.uber.com/favicon.ico',
      description: 'Pioneering global mobility platform, food delivery, and freight technology.',
    },
    {
      name: 'D. E. Shaw & Co.',
      industry: 'Quantitative Finance & Tech',
      websiteUrl: 'https://deshaw.com',
      logoUrl: 'https://www.deshaw.com/favicon.ico',
      description: 'Global investment and technology development firm renowned for mathematical rigor.',
    },
    {
      name: 'Cisco',
      industry: 'Networking & Cybersecurity',
      websiteUrl: 'https://cisco.com/careers',
      logoUrl: 'https://www.cisco.com/favicon.ico',
      description: 'Worldwide leader in IT, enterprise networking, cloud, and cybersecurity solutions.',
    },
  ];

  const companyMap = new Map<string, string>();
  for (const c of companiesData) {
    const slug = slugify(c.name, { lower: true, strict: true });
    const created = await prisma.company.upsert({
      where: { slug },
      update: {},
      create: {
        name: c.name,
        slug,
        industry: c.industry,
        websiteUrl: c.websiteUrl,
        logoUrl: c.logoUrl,
        description: c.description,
      },
    });
    companyMap.set(c.name, created.id);
  }

  // 3. Seed Users
  console.log('👤 Seeding campus users & moderators...');
  const user1 = await prisma.user.upsert({
    where: { email: 'aarav.sharma@thapar.edu' },
    update: {},
    create: {
      authId: '11111111-1111-1111-1111-111111111111',
      email: 'aarav.sharma@thapar.edu',
      fullName: 'Aarav Sharma',
      collegeName: 'Thapar Institute of Engineering & Technology',
      collegeDomain: 'thapar.edu',
      graduationYear: 2025,
      branch: 'Computer Science and Engineering',
      role: 'STUDENT',
      isVerified: true,
      bio: 'Incoming SDE-1 at Amazon. Passionate about distributed systems and competitive programming.',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'priya.nair@iitb.ac.in' },
    update: {},
    create: {
      authId: '22222222-2222-2222-2222-222222222222',
      email: 'priya.nair@iitb.ac.in',
      fullName: 'Priya Nair',
      collegeName: 'IIT Bombay',
      collegeDomain: 'iitb.ac.in',
      graduationYear: 2025,
      branch: 'Electrical Engineering & Computer Science',
      role: 'MODERATOR',
      isVerified: true,
      bio: 'Placement Coordinator & SDE Intern @ Google. Happy to review interview experiences.',
    },
  });

  // 4. Seed Comprehensive Interview Experiences
  console.log('📝 Seeding interview experiences and question bank...');

  const amazonExp = await prisma.interviewExperience.create({
    data: {
      userId: user1.id,
      companyId: companyMap.get('Amazon')!,
      roleTitle: 'Software Development Engineer - 1',
      expType: 'ON_CAMPUS',
      batchYear: 2025,
      placementCycleYear: 2024,
      outcome: 'SELECTED',
      overallDifficulty: 'MEDIUM',
      totalRounds: 4,
      compensationCtc: 44.5,
      location: 'Bangalore / Hyderabad',
      overview:
        'Amazon visited our campus in August. The process started with an online assessment followed by 3 technical virtual interviews covering DSA, Low-Level Design, and Amazon Leadership Principles (LP).',
      preparationTips:
        'Practice LeetCode medium/hard questions on Trees, Graphs, and DP. Make sure to prepare 2-3 detailed stories using the STAR methodology for every single Amazon Leadership Principle.',
      status: 'APPROVED',
      upvoteCount: 28,
      commentCount: 4,
      viewCount: 340,
      rounds: {
        create: [
          {
            roundNumber: 1,
            roundName: 'Online Assessment (OA)',
            roundType: 'ONLINE_ASSESSMENT',
            difficulty: 'MEDIUM',
            durationMinutes: 90,
            description: '2 coding questions + Work Style Assessment (LP questionnaire).',
            questions: {
              create: [
                {
                  categoryId: categoryMap.get('dsa')!,
                  questionText: 'Find the minimum number of packages required to fulfill delivery trucks with weight limits.',
                  answerApproach: 'Solved using Greedy approach with two pointers after sorting the array.',
                  difficulty: 'MEDIUM',
                  topicTag: 'Greedy / Two Pointers',
                },
                {
                  categoryId: categoryMap.get('dsa')!,
                  questionText: 'Find all pairs in an inventory list whose total weight is divisible by 60.',
                  answerApproach: 'Used a frequency hashmap modulo 60 to achieve O(N) time complexity.',
                  difficulty: 'MEDIUM',
                  topicTag: 'Hash Maps',
                },
              ],
            },
          },
          {
            roundNumber: 2,
            roundName: 'Technical Interview 1 (DSA + LP)',
            roundType: 'TECHNICAL',
            difficulty: 'MEDIUM',
            durationMinutes: 60,
            description: 'In-depth coding discussion on live shared code editor + 20 minutes of Behavioral LP.',
            questions: {
              create: [
                {
                  categoryId: categoryMap.get('dsa')!,
                  questionText: 'Given a binary tree, serialize and deserialize it back to the original structure.',
                  answerApproach: 'Implemented pre-order traversal with delimiter and null identifiers using BFS Queue.',
                  difficulty: 'HARD',
                  topicTag: 'Binary Trees / BFS',
                },
                {
                  categoryId: categoryMap.get('hr')!,
                  questionText: 'Tell me about a time you had a disagreement with a team member and how you resolved it (Disagree and Commit).',
                  answerApproach: 'Used STAR format: Situation with college capstone project database choice, backed argument with benchmarking data.',
                  difficulty: 'MEDIUM',
                  topicTag: 'Leadership Principles',
                },
              ],
            },
          },
          {
            roundNumber: 3,
            roundName: 'Technical Interview 2 (Data Structures & OOP)',
            roundType: 'TECHNICAL',
            difficulty: 'HARD',
            durationMinutes: 60,
            description: 'Graph problem solving followed by Object Oriented Design principles.',
            questions: {
              create: [
                {
                  categoryId: categoryMap.get('dsa')!,
                  questionText: 'Word Ladder II: Find all shortest transformation sequences from beginWord to endWord.',
                  answerApproach: 'Bidirectional BFS to compute shortest distance levels, followed by DFS backtracking to construct paths.',
                  difficulty: 'HARD',
                  topicTag: 'Graphs / BFS / Backtracking',
                },
                {
                  categoryId: categoryMap.get('oop')!,
                  questionText: 'Design an in-memory Parking Lot system following SOLID design principles.',
                  answerApproach: 'Demonstrated Strategy pattern for fee calculation and Factory pattern for vehicle slot allocation.',
                  difficulty: 'MEDIUM',
                  topicTag: 'Low-Level Design / OOP',
                },
              ],
            },
          },
        ],
      },
    },
  });

  const googleExp = await prisma.interviewExperience.create({
    data: {
      userId: user2.id,
      companyId: companyMap.get('Google')!,
      roleTitle: 'Software Engineer (SWE)',
      expType: 'ON_CAMPUS',
      batchYear: 2025,
      placementCycleYear: 2024,
      outcome: 'SELECTED',
      overallDifficulty: 'HARD',
      totalRounds: 3,
      compensationCtc: 55.0,
      location: 'Bangalore',
      overview:
        'Google recruitment process was purely focused on algorithmic problem solving, clean code quality, scalability considerations, and Googleyness.',
      preparationTips:
        'Focus on writing clean, modular code on Google Docs without IDE auto-complete. Verbalize every single thought process and discuss time/space complexities upfront.',
      status: 'APPROVED',
      upvoteCount: 42,
      commentCount: 6,
      viewCount: 520,
      rounds: {
        create: [
          {
            roundNumber: 1,
            roundName: 'Coding Round 1',
            roundType: 'TECHNICAL',
            difficulty: 'HARD',
            durationMinutes: 45,
            description: 'Advanced graph problem with shortest path constraint.',
            questions: {
              create: [
                {
                  categoryId: categoryMap.get('dsa')!,
                  questionText: 'Find shortest path in a graph with negative edge weights and maximum k stops.',
                  answerApproach: 'Used Modified Bellman-Ford / DP with state DP[k][node].',
                  difficulty: 'HARD',
                  topicTag: 'Dynamic Programming on Graphs',
                },
              ],
            },
          },
          {
            roundNumber: 2,
            roundName: 'Coding Round 2 & Concurrency',
            roundType: 'TECHNICAL',
            difficulty: 'HARD',
            durationMinutes: 45,
            description: 'Concurrency and sliding window rate calculation.',
            questions: {
              create: [
                {
                  categoryId: categoryMap.get('os')!,
                  questionText: 'Explain race conditions, mutex locks, and condition variables with a real-time producer-consumer buffer.',
                  answerApproach: 'Detailed memory barrier concepts, mutex contention, and POSIX threads synchronization.',
                  difficulty: 'HARD',
                  topicTag: 'Operating Systems / Concurrency',
                },
                {
                  categoryId: categoryMap.get('system-design')!,
                  questionText: 'Design a distributed distributed ID generator with 64-bit sequence numbers.',
                  answerApproach: 'Explained Twitter Snowflake architecture (timestamp + datacenter ID + worker ID + sequence counter).',
                  difficulty: 'HARD',
                  topicTag: 'System Design / Distributed Systems',
                },
              ],
            },
          },
        ],
      },
    },
  });

  // Update experience counters on companies
  await prisma.company.update({
    where: { id: companyMap.get('Amazon')! },
    data: { totalExperiencesCount: 1 },
  });
  await prisma.company.update({
    where: { id: companyMap.get('Google')! },
    data: { totalExperiencesCount: 1 },
  });

  // Seed sample comment
  await prisma.comment.create({
    data: {
      userId: user2.id,
      experienceId: amazonExp.id,
      content: 'Super helpful breakdown of the LP rounds! Did they ask any follow-up on system design during the OA?',
    },
  });

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
