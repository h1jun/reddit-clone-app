import { IsEmail } from "class-validator";
import { Length } from "class-validator/types/decorator/decorators";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  OneToMany,
  BeforeInsert,
} from "typeorm";
import bcrypt from "bcryptjs";
import Post from "./Post";
import Vote from "./Vote";
@Entity("users")
export class User {
  @Index()
  @IsEmail(undefined, { message: "이메일 주소가 잘못 되었습니다." }) // 유효성 검사
  @Length(1, 255, { message: "이메일 주소는 비워둘 수 없습니다." }) // 유효성 검사
  @Column({ unique: true }) // 컬럼값은 유니크 값
  email: string;

  @Index()
  @Length(3, 32, { message: "사용자 이름은 3자 이상이어야 합니다." })
  @Column()
  username: string;

  @Column()
  @Length(6, 255, { message: "비밀번호는 6자리 이상이어야 합니다." })
  password: string;

  // 관계 형성
  // Post :: 타입지정, post.user :: post 컬럼 안에 엔티티 지정
  // 한 명의 유저가 많은 글을 올릴 수 있고 투표도 할 수 있어서 OneToMany
  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(() => Vote, (vote) => vote.user)
  votes: Vote[];

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 6);
  }
}
