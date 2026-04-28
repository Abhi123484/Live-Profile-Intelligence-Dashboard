const Score = require('../models/Score');
const Profile = require('../models/Profile');
const Result = require('../models/Result');
const ActivityLog = require('../models/ActivityLog');
const Badge = require('../models/Badge');

const BADGE_TYPES = {
  PROFILE_COMPLETE: 'Profile Complete',
  FIRST_ASSESSMENT: 'First Assessment',
  QUIZ_MASTER: 'Quiz Master',
  BRONZE_LEVEL: 'Bronze Achiever',
  SILVER_LEVEL: 'Silver Achiever',
  GOLD_LEVEL: 'Gold Achiever',
  PLATINUM_LEVEL: 'Platinum Legend',
  ACTIVE_USER: 'Active Contributor',
  SKILL_COLLECTOR: 'Skill Collector'
};

const calculateProfileScore = (profile) => {
  if (!profile) return 0;
  let completeness = 0;
  if (profile.fullName) completeness += 10;
  if (profile.location) completeness += 10;
  if (profile.gender) completeness += 5;
  if (profile.birthdate) completeness += 5;
  if (profile.phone) completeness += 10;
  if (profile.bio) completeness += 15;
  if (profile.skills && profile.skills.length > 0) completeness += 20;
  if (profile.education && profile.education.length > 0) completeness += 10;
  if (profile.photoUrl) completeness += 10;
  if (profile.links && (profile.links.github || profile.links.linkedin || profile.links.portfolio)) completeness += 5;
  // Max 100% -> maps to 300 points (30% weight)
  return (completeness / 100) * 300;
};

const calculateAssessmentScore = async (userId) => {
  const results = await Result.find({ userId });
  if (results.length === 0) return 0;
  
  const avgScore = results.reduce((acc, curr) => acc + curr.score, 0) / results.length;
  // Max 100% -> maps to 400 points (40% weight)
  return (avgScore / 100) * 400;
};

const calculateActivityScore = async (userId) => {
  const activities = await ActivityLog.find({ userId });
  const activityCount = activities.length;
  // More granular: 30 activities = 100%
  const activityPct = Math.min((activityCount / 30) * 100, 100);
  // Max 100% -> maps to 300 points (30% weight)
  return (activityPct / 100) * 300;
};

const getLevel = (totalScore) => {
  if (totalScore >= 750) return 'Platinum';
  if (totalScore >= 500) return 'Gold';
  if (totalScore >= 250) return 'Silver';
  return 'Bronze';
};

const checkAndAwardBadges = async (userId, profile, results, activityCount, newLevel, oldLevel, io) => {
  const existingBadges = await Badge.find({ userId });
  const existingTypes = existingBadges.map(b => b.badgeType);
  const newBadges = [];

  // Profile Complete badge
  if (profile && profile.completionPct >= 100 && !existingTypes.includes(BADGE_TYPES.PROFILE_COMPLETE)) {
    newBadges.push(BADGE_TYPES.PROFILE_COMPLETE);
  }

  // First Assessment badge
  if (results.length >= 1 && !existingTypes.includes(BADGE_TYPES.FIRST_ASSESSMENT)) {
    newBadges.push(BADGE_TYPES.FIRST_ASSESSMENT);
  }

  // Quiz Master badge (5+ assessments with avg > 80%)
  if (results.length >= 5) {
    const avg = results.reduce((a, r) => a + r.score, 0) / results.length;
    if (avg >= 80 && !existingTypes.includes(BADGE_TYPES.QUIZ_MASTER)) {
      newBadges.push(BADGE_TYPES.QUIZ_MASTER);
    }
  }

  // Active User badge (10+ activities)
  if (activityCount >= 10 && !existingTypes.includes(BADGE_TYPES.ACTIVE_USER)) {
    newBadges.push(BADGE_TYPES.ACTIVE_USER);
  }

  //Skill Collector badge (5+ skills)
  if (profile && profile.skills && profile.skills.length >= 5 && !existingTypes.includes(BADGE_TYPES.SKILL_COLLECTOR)) {
    newBadges.push(BADGE_TYPES.SKILL_COLLECTOR);
  }

  // Level badges
  const levelBadgeMap = {
    'Bronze': BADGE_TYPES.BRONZE_LEVEL,
    'Silver': BADGE_TYPES.SILVER_LEVEL,
    'Gold': BADGE_TYPES.GOLD_LEVEL,
    'Platinum': BADGE_TYPES.PLATINUM_LEVEL
  };
  if (levelBadgeMap[newLevel] && !existingTypes.includes(levelBadgeMap[newLevel])) {
    newBadges.push(levelBadgeMap[newLevel]);
  }

  // Save new badges and emit events
  for (const badgeType of newBadges) {
    const badge = new Badge({ userId, badgeType });
    await badge.save();
    if (io) {
      io.to(userId.toString()).emit('badgeUnlocked', { badgeType, unlockedAt: new Date() });
    }
  }

  return newBadges;
};

