describe("Login", () => {
	it("should login successfully", () => {
		cy.visit("http://localhost:5000");
		cy.get("input[type=text]").type("usuario@email.com");
		cy.get("input[type=password").type("senha_super_secreta");
		cy.get(".submit").click();
		
		cy.url().should("equal", "http://localhost:5000/app");
	});
});