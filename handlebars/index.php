<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<title>Object</title>
	<link rel="stylesheet" href="https://bootswatch.com/4/flatly/bootstrap.min.css">
</head>
<body>
<div class="row">
	<dir col-md-4>
		<input type="text" name="first_name" id="first_name" class="form-control">
	</dir>
	<dir col-md-4>
		<input type="text" name="last_name" id="last_name" class="form-control">
	</dir>
	<dir col-md-4>
		<input type="submit" value="Submit" id="SubmitUser" name="submit" class="btn btn-primary">
	</dir>
</div>
<dir class="row">
	<dir id="error"></dir>
	<table id="usersListTable" class="table table-hover">
		<thead>
			<tr>
				<th>First Name</th>
				<th>Last Name</th>
				<th>Action</th>
			</tr>
		</thead>
		<tbody></tbody>
	</table>
</dir>
<script type="text/javascript" src="handlebars-v4.0.11.js"></script>
<script type="text/x-handlebars-template" id="UsersListTemplate">
	{{#each people}}
	<tr>
		<td>{{user_first_name}}</td>
		<td>{{user_last_name}}</td>
		<td><button type="button" class="btn btn-default deleteUser" onClick="deleteUserAction({{@index}})">x</button></td>
	</tr>
	{{/each}}
</script>
<script type="text/javascript">

	var error = document.querySelector("#error");
	var usersListTable = document.querySelector("#usersListTable tbody");
	var first_name = document.querySelector("#first_name");
	var last_name = document.querySelector("#last_name");
	var SubmitUser = document.querySelector("#SubmitUser");

	SubmitUser.addEventListener("click",addUserToList);

	function Person(personDetail){
		this.saveUserInfo = function(userJson) {
			var savedUser = this.getSavedUsers();
			if( savedUser != 0 ) {
				users = JSON.parse(savedUser);
				users.push(userJson);
				this.saveStorage(users);
			}else{
				var user = [];
				user.push(userJson);
				this.saveStorage(user);
			}
			this.showSavedUsersList();
		}

		this.getSavedUsers = function() {
			var users = localStorage.getItem("usersList");
			if( users != null ) {
				return users;
			}else{
				return 0;
			}
		}

		this.saveStorage = function(users) {
			if(users != "") {
				localStorage.setItem("usersList",JSON.stringify(users));
			}else{
				localStorage.setItem("usersList","[]");
			}
		}

		this.showSavedUsersList = function() {
			var savedUser = JSON.parse(this.getSavedUsers());
			usersListTable.innerHTML = "";
			if( savedUser != 0 ) {
				var source = document.getElementById('UsersListTemplate').innerHTML;
				var template = Handlebars.compile(source);
				var html    = template({people:savedUser});
				usersListTable.innerHTML = html;
			}
		}

		this.deleteUserFromList = function(id) {
			var savedUser = JSON.parse(this.getSavedUsers());
			if( savedUser != 0 ) {
				for (var i = 0; i < savedUser.length; i++) {
					if(i == id) {
						savedUser.splice(id, 1);
					}
				}
				this.saveStorage(savedUser);				
				this.showSavedUsersList();
			}
		}
	}
	var p1 = new Person();

	p1.showSavedUsersList();

	function addUserToList() {
		if(validation()) {
			var user = {
				user_first_name: first_name.value,
				user_last_name: last_name.value,
			}
			p1.saveUserInfo(user);
		}
	}

	function validation() {
		if(first_name.value == "") {
			error.innerHTML = '<p>Enter First Name</p>';
			return false;
		}else if (last_name.value == "") {
			error.innerHTML = '<p>Enter Last Name</p>';
			return false;
		}else if(first_name.value == last_name.value){
			error.innerHTML = '<p>First name and Last Name Should be different.</p>';
			return false;
		}else{
			error.innerHTML = '';
			return true;
		}
	}

	function deleteUserAction(i) {
		p1.deleteUserFromList(i);
	}
</script>
</body>
</html>