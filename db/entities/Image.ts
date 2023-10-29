import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
// import { URL } from "url";

@Entity()
export class Image extends BaseEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({})
  url: string;
  @Column({ default: "{}", length: 5000 })
  result: string;

  @Column({
    type: "enum",
    enum: ["identify", "celebs", "findText"],
    default: "identify",
  })
  type: "identify" | "celebs" | "findText";
}
