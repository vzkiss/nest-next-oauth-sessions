# Tradeoffs

[decisions.md](decisions.md) · [auth-architecture.md](auth-architecture.md)

## Sessions vs JWT

**Sessions (this repo)**

**+** Immediate invalidation (logout and server-side revoke)  
**+** Simpler security model  
**-** Requires shared session store

**JWT**

Compared below as an alternative for **browser / interactive** auth. JWT is also a common fit for service-to-service and third-party APIs (a different shape than this sample).

**+** Stateless  
**+** Often easier horizontal scaling (no session store hot path)  
**-** Harder revocation  
**-** Token leakage risk  
**-** More complex client handling

---

## API-owned auth vs Next-only auth

**API-owned (this repo)**

**+** Works across multiple clients (e.g. web, mobile)  
**+** Clear trust boundary  
**+** Room to grow from one app toward distributed systems

**Next-only**

**+** Faster setup  
**+** Good for single-app deployments (Next owns both UI and session issuance)  
**-** Hard to extend beyond one frontend
