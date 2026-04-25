import axios from "axios";

async function run() {
  try {
    const res = await axios.post("http://127.0.0.1:6100/api/users", {
      name: "Teste Usuário",
      email: "teste@teste.com",
      phone: "123",
      role: "admin",
      accessLevel: "manager",
      password: "123",
      customPermissions: ["dashboard"]
    }, {
      headers: {
        "Authorization": "Bearer fake_token_or_we_need_one"
      }
    });
    console.log(res.status, res.data);
  } catch (e) {
    console.log(e.response?.status, e.response?.data || e.message);
  }
}
run();
