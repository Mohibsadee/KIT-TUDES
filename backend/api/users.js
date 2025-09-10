// POST /api/users
const { uid, displayName, email, photoURL } = req.body;
const user = await User.findOneAndUpdate(
  { uid },
  { displayName, email, photoURL },
  { upsert: true, new: true }
);
res.json(user);
