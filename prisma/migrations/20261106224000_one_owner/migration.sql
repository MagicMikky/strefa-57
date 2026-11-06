-- At most one staff owner. A second concurrent bootstrap hits this index
-- instead of inserting another owner between the count check and the insert.
CREATE UNIQUE INDEX "User_one_owner_key" ON "User" ("role") WHERE "role" = 'owner';
