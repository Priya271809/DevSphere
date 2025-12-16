const adminAuth = (req, res, next) => {
  console.log("Admin auth is getting checked!!");
  const token = "xyz";
  const isAdminAuthorised = token === "xyz";

  if (!isAdminAuthorised) {
    return res.status(481).send("Unauthorized request");
  }
  next();
};

const userAuth = (req, res, next) => {
  console.log("User auth is getting checked!!");
  const token = "xyzabhhdfhfgdsgfgh";
  const isUserAuthorised = token === "xyz";

  if (!isUserAuthorised) {
    return res.status(481).send("Unauthorized request");
  }
  next();
};

module.exports = {
  adminAuth,
  userAuth,
};
