// backend/models/User.js — Supabase version
const bcrypt = require('bcryptjs');

const getClient = () => {
  const sb = require('../config/supabase');
  if (!sb) throw new Error('Database not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  return sb;
};

const User = {
  async findOne({ username }) {
    const supabase = getClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    if (error || !data) return null;
    return { ...data, comparePassword: async (pwd) => bcrypt.compare(pwd, data.password) };
  },

  async create({ username, email, password }) {
    const supabase = getClient();
    const hashed = await bcrypt.hash(password, 10);
    const { data, error } = await supabase
      .from('users')
      .insert({ 
        username, 
        email, 
        password: hashed, 
        role: 'user',
        status: 'pending' // New users start as pending
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async findAllPending() {
    const supabase = getClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('status', 'pending');
    if (error) throw new Error(error.message);
    return data || [];
  },

  async approve(userId) {
    const supabase = getClient();
    const { data, error } = await supabase
      .from('users')
      .update({ status: 'approved' })
      .eq('id', userId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async reject(userId) {
    const supabase = getClient();
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);
    if (error) throw new Error(error.message);
    return true;
  }
};

module.exports = User;