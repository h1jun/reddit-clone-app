import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import BaseEntity from "./Entity";
import Post from "./Post";
import { User } from "./User";

// post와 comment에 대한 vote
// comment에 대한 vote면 postId는 null
// postId에 대한 vote면 commentId는 null
@Entity("votes")
export default class Vote extends BaseEntity {
  @Column()
  value: number; // 1 아니면 -1

  // 투표를 한 유저
  @ManyToOne(() => User)
  @JoinColumn({ name: "username", referencedColumnName: "username" })
  user: User;

  @Column()
  username: string;

  @Column({ nullable: true })
  postId: number;

  @ManyToOne(() => Post)
  post: Post;

  @Column({ nullable: true })
  commentId: number;

  @ManyToOne(() => Comment)
  comment: Comment;
}
