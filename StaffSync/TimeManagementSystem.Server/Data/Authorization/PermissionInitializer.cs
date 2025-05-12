//using TimeManagementSystem.Server.Models;

//namespace TimeManagementSystem.Server.Data.Authorization
//{
//    public class PermissionInitializer
//    {
//        private readonly PermissionManager _permissionManager;

//        public PermissionInitializer(PermissionManager permissionManager)
//        {
//            _permissionManager = permissionManager;
//        }

//        public async Task<List<PermissionsModel>> Initialize()
//        {
//            List<PermissionsModel> createdPermissions = new List<PermissionsModel>();

//            string[] permissionNames = { "ReadMember", "WriteMember", "DeleteMember", "ReadSalary", "WriteSalary", "DeleteSalary" };
//            foreach (var permissionName in permissionNames)
//            {
//                var permissionExist = await _permissionManager.PermissionExistsAsync(permissionName);
//                if (!permissionExist)
//                {
//                    var newPermission = new PermissionsModel { RoleName = permissionName };
//                    var permissionResult = await _permissionManager.CreateAsync(newPermission);
//                    if (permissionResult != null)
//                    {
//                        createdPermissions.Add(newPermission);
//                    }
//                    else
//                    {
//                        throw new Exception($"Failed to create permission {permissionName}");
//                    }
//                }
//            }

//            return createdPermissions;
//        }
//    }
//}
