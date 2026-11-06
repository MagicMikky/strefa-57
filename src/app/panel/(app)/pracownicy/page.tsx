import { listStaffForOwner, createStaffAction, setStaffStatusAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const staff = await listStaffForOwner();
  return (
    <div className="grid gap-8">
      <h2 className="text-2xl font-black">Pracownicy</h2>
      <ul className="grid gap-3">
        {staff.map((member) => (
          <li key={member.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3">
            <div>
              <strong>{member.name}</strong>
              <p className="text-sm text-[var(--muted)]">
                {member.email} · {member.role} · {member.status === "active" ? "aktywny" : "zablokowany"}
              </p>
            </div>
            {member.role === "owner" ? null : (
              <form action={setStaffStatusAction}>
                <input name="userId" type="hidden" value={member.id} />
                <input name="status" type="hidden" value={member.status === "active" ? "disabled" : "active"} />
                <button className="rounded-full border border-black/15 px-4 py-2 text-sm font-semibold" type="submit">
                  {member.status === "active" ? "Zablokuj i unieważnij sesje" : "Odblokuj"}
                </button>
              </form>
            )}
          </li>
        ))}
      </ul>
      <form action={createStaffAction} className="grid max-w-md gap-3 rounded-3xl bg-white p-5">
        <h3 className="text-xl font-black">Nowe konto</h3>
        <label className="grid gap-1 text-sm font-semibold">
          Imię i nazwisko
          <input className="rounded-xl border border-black/15 px-3 py-2" name="name" required minLength={2} maxLength={100} />
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          E-mail
          <input className="rounded-xl border border-black/15 px-3 py-2" name="email" type="email" required />
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Hasło tymczasowe
          <input className="rounded-xl border border-black/15 px-3 py-2" name="password" type="password" required minLength={12} autoComplete="new-password" />
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Rola
          <select className="rounded-xl border border-black/15 px-3 py-2" name="role" defaultValue="employee">
            <option value="employee">Pracownik</option>
            <option value="manager">Manager</option>
          </select>
        </label>
        <button className="w-fit rounded-full bg-[var(--forest)] px-4 py-2 font-semibold text-white" type="submit">
          Utwórz konto
        </button>
      </form>
    </div>
  );
}
