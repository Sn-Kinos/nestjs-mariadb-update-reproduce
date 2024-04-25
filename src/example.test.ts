import { Entity, MikroORM, PrimaryKey, Property } from '@mikro-orm/mariadb';

@Entity()
class User {
  @PrimaryKey()
  id!: number;

  @Property()
  name: string;

  @Property({ type: 'json', unique: true })
  email: object;

  constructor(name: string, email: object) {
    this.name = name;
    this.email = email;
  }

  qurare? = 'magic library';
}

let orm: MikroORM;

beforeAll(async () => {
  orm = await MikroORM.init({
    entities: [User],
    debug: ['query', 'query-params'],
    allowGlobalContext: true, // only for testing
    forceEntityConstructor: true,
    clientUrl: 'your-mariadb-11.3-url',
  });
  await orm.schema.refreshDatabase();
});

afterAll(async () => {
  await orm.close(true);
});

test('basic CRUD example', async () => {
  orm.em.create(User, { name: 'Foo', email: { a: 1 } });
  await orm.em.flush();
  orm.em.clear();

  await orm.em.transactional(async (em) => {
    const user = await orm.em.findOneOrFail(User, { name: 'Foo' });
    expect(user.qurare).toBe('magic library'); // It might be failed when forceEntityConstructor: false
  });
});
