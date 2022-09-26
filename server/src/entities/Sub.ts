import { Expose } from "class-transformer";
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import BaseEntity from "./Entity";
@Entity("subs")
export default class Sub extends BaseEntity {
  @Index()
  @Column({ unique: true })
  name: string;

  @Column()
  title: string;

  // nullable: true은 description이 없어도 된다의 뜻
  @Column({ type: "text", nullable: true })
  description: string;

  // 이미지가 없으면 기본 이미지를 넣어줄 거다.
  @Column({ nullable: true })
  imageUrn: string;

  @Column({ nullable: true })
  bannerUrn: string;

  // 외래키
  @Column()
  usrname: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "username", referencedColumnName: "username" })
  user: User;

  @OneToMany(() => Post, (post => post.sub)
  posts: Post[]

  // class transformer
  // fe에서 처리 안 하고 be에서 처리
  @Expose()
  get imageUrl(): string {
    return this.imageUrn
      ? `${process.env.APP_URL}/images/${this.imageUrn}`
      : "https://www.gravatar.com/avatar?d=mp&f=y";
  }

  @Expose()
  get bannerUrl(): string | undefined {
    return this.bannerUrn
      ? `${process.env.APP_URL}/images/${this.bannerUrn}`
      : undefined;
  }
}
