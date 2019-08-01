function hasPermission(user, permissionsNeeded) {
  const matchedPermissions = user.permissions.filter(permissionTheyHave =>
    permissionsNeeded.includes(permissionTheyHave)
  )
  if (!matchedPermissions.length) {
    throw new Error(`You do not have sufficient permissions

      : ${permissionsNeeded}

      You have:

      ${user.permissions}
      `)
  }
}

function isSignedIn(ctx) {
  if (!ctx.request.userId) {
    throw new Error("You must be logged in!")
  }
}

exports.hasPermission = hasPermission
exports.isSignedIn = isSignedIn
