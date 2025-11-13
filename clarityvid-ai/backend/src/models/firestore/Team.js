const { db, Timestamp } = require('../../config/firebase');

class Team {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.ownerId = data.ownerId;
    this.description = data.description || null;
    this.plan = data.plan || 'free';
    this.credits = data.credits || 0;
    this.creditsUsed = data.creditsUsed || 0;
    this.settings = data.settings || {};
    this.createdAt = data.createdAt || Timestamp.now();
    this.updatedAt = data.updatedAt || Timestamp.now();
  }

  // Create team
  static async create(teamData) {
    try {
      const teamRef = db.collection('teams').doc();

      const team = new Team({
        id: teamRef.id,
        ...teamData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      await teamRef.set(JSON.parse(JSON.stringify(team)));

      // Add owner as team member
      const memberRef = db.collection('teamMembers').doc();
      await memberRef.set({
        id: memberRef.id,
        teamId: team.id,
        userId: team.ownerId,
        role: 'owner',
        permissions: ['all'],
        joinedAt: Timestamp.now(),
        createdAt: Timestamp.now(),
      });

      return team;
    } catch (error) {
      throw new Error('Error creating team: ' + error.message);
    }
  }

  // Find by ID
  static async findById(teamId) {
    try {
      const doc = await db.collection('teams').doc(teamId).get();

      if (!doc.exists) {
        return null;
      }

      return new Team({ id: doc.id, ...doc.data() });
    } catch (error) {
      throw new Error('Error finding team: ' + error.message);
    }
  }

  // Find teams by user ID (teams where user is a member)
  static async findByUserId(userId) {
    try {
      // Get team memberships
      const membershipsSnapshot = await db.collection('teamMembers')
        .where('userId', '==', userId)
        .get();

      if (membershipsSnapshot.empty) {
        return [];
      }

      const teamIds = membershipsSnapshot.docs.map(doc => doc.data().teamId);

      // Get teams
      const teams = [];
      for (const teamId of teamIds) {
        const team = await this.findById(teamId);
        if (team) {
          teams.push(team);
        }
      }

      return teams;
    } catch (error) {
      throw new Error('Error finding user teams: ' + error.message);
    }
  }

  // Update team
  static async update(teamId, updates) {
    try {
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      await db.collection('teams').doc(teamId).update(updateData);
      return await this.findById(teamId);
    } catch (error) {
      throw new Error('Error updating team: ' + error.message);
    }
  }

  // Delete team
  static async delete(teamId) {
    try {
      // Delete team members
      const membersSnapshot = await db.collection('teamMembers')
        .where('teamId', '==', teamId)
        .get();

      const batch = db.batch();
      membersSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      // Delete team
      await db.collection('teams').doc(teamId).delete();
      return true;
    } catch (error) {
      throw new Error('Error deleting team: ' + error.message);
    }
  }

  // Add team member
  static async addMember(teamId, userId, role = 'member') {
    try {
      const memberRef = db.collection('teamMembers').doc();

      await memberRef.set({
        id: memberRef.id,
        teamId,
        userId,
        role,
        permissions: role === 'owner' ? ['all'] : ['read', 'write'],
        joinedAt: Timestamp.now(),
        createdAt: Timestamp.now(),
      });

      return true;
    } catch (error) {
      throw new Error('Error adding team member: ' + error.message);
    }
  }

  // Remove team member
  static async removeMember(teamId, userId) {
    try {
      const snapshot = await db.collection('teamMembers')
        .where('teamId', '==', teamId)
        .where('userId', '==', userId)
        .limit(1)
        .get();

      if (!snapshot.empty) {
        await snapshot.docs[0].ref.delete();
      }

      return true;
    } catch (error) {
      throw new Error('Error removing team member: ' + error.message);
    }
  }

  // Get team members
  static async getMembers(teamId) {
    try {
      const snapshot = await db.collection('teamMembers')
        .where('teamId', '==', teamId)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      throw new Error('Error getting team members: ' + error.message);
    }
  }
}

module.exports = Team;
