import { Prisma } from '@prisma/client'
import { DefaultArgs } from '@prisma/client/runtime/library'
import prismadb from 'src/libs/prismadb'

class PostRepo {
  private post: Prisma.postDelegate<DefaultArgs>
  constructor() {
    this.post = prismadb.post
  }

  /**
   * this method only responsible to check where post exist or not based on post_id and community_id
   * @param post_id
   * @param community_id
   */
  public isExist(post_id: string, community_id: string) {
    return this.post.findFirst({
      where: {
        post_id,
        community_id
      },
      select: {
        post_id: true,
        member_id: true,
        hasPublished: true
      }
    })
  }

  /**
   *
   * @param community_id
   * @param post_id
   * @returns
   */
  public findUniquePost(community_id: string, post_id: string) {
    return this.post.findUnique({
      where: {
        post_id,
        community_id
        // member: {
        //   user_id
        // }
      },
      select: {
        post_id: true
      }
    })
  }

  /**
   * get post by postId
   * @param post_id this should be postId
   * @returns post_id community_id member_id title body hasPublished createdAt updatedAt
   */
  public get(post_id: string, community_id: string) {
    return this.post.findFirst({
      where: {
        post_id,
        community_id,
        hasPublished: true,
        isVisible: true,
        deletedAt: null
      },
      select: {
        post_id: true,
        community_id: true,
        member_id: true,
        body: true,
        image_url: true,
        hasPublished: true,
        createdAt: true
      }
    })
  }

  /**
   * createPost
   */
  public async createPost(
    data:
      | (Prisma.Without<Prisma.postCreateInput, Prisma.postUncheckedCreateInput> & Prisma.postUncheckedCreateInput)
      | (Prisma.Without<Prisma.postUncheckedCreateInput, Prisma.postCreateInput> & Prisma.postCreateInput),
    user_id: string
  ) {
    return await this.post.create({
      data: {
        ...data,
        reacts: {
          create: {
            member_id: data.member_id,
            react_type: 'UNLIKE'
          }
        }
      },
      select: {
        post_id: true,
        community_id: true,
        member_id: true,
        body: true,
        image_url: true,
        createdAt: true,
        updatedAt: true,
        reacts: {
          where: {
            member: {
              user_id
            }
          },
          select: {
            react_type: true
          }
        },
        member: {
          select: {
            user: {
              select: {
                fullname: true,
                username: true,
                avatar: true
              }
            }
          }
        },
        community: {
          select: {
            name: true
          }
        }
      }
    })
  }

  /**
   * get post by postId
   * @param post_id this should be postId
   */
  public postVisibility(post_id: string) {
    return this.post.findFirst({
      where: {
        post_id
      },
      select: {
        post_id: true,
        community_id: true,
        isVisible: true
      }
    })
  }

  /**
   * get member posts by pagination or all posts
   * @param community_id this should community_id
   * @param member_id -> member_id but if next params exist -> falsy value
   * @param page optional filed
   * @param limit optional field
   */
  public getMemberPosts(member_id: string, page: number, limit: number) {
    return this.post.findMany({
      where: {
        member_id,
        hasPublished: true,
        isVisible: true,
        deletedAt: null,
        member: {
          leavedAt: null
        }
      },
      select: {
        post_id: true,
        community_id: true,
        member_id: true,
        body: true,
        image_url: true,
        createdAt: true,
        updatedAt: true,
        member: {
          select: {
            user: {
              select: {
                user_id: true,
                fullname: true,
                username: true,
                avatar: true
              }
            }
          }
        },
        community: {
          select: {
            name: true
          }
        }
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' }
    })
  }

  /**
   * getPostsWithUserId ->> Get posts by userId
   */
  public getPostsByUserId(user_id: string, page: number, limit: number) {
    return this.post.findMany({
      where: {
        member: {
          user_id
        },
        deletedAt: null,
        isVisible: true,
        hasPublished: true
      },
      select: {
        post_id: true,
        community_id: true,
        member_id: true,
        body: true,
        image_url: true,
        createdAt: true,
        updatedAt: true,
        member: {
          select: {
            user: {
              select: {
                user_id: true,
                fullname: true,
                username: true,
                avatar: true
              }
            }
          }
        },
        community: {
          select: {
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    })
  }

  /**
   * getPostsWithUserId ->> Get posts by userId
   */
  public getPostByPostId(post_id: string, user_id: string) {
    return this.post.findFirst({
      where: {
        post_id,
        deletedAt: null,
        isVisible: true,
        hasPublished: true
      },
      select: {
        post_id: true,
        community_id: true,
        member_id: true,
        body: true,
        image_url: true,
        reacts: {
          where: {
            post_id,
            member: {
              user_id
            }
          },
          select: {
            react_type: true
          }
        },
        createdAt: true,
        updatedAt: true,
        member: {
          select: {
            user: {
              select: {
                user_id: true,
                fullname: true,
                username: true,
                avatar: true
              }
            }
          }
        },
        community: {
          select: {
            members: {
              where: {
                user_id
              },
              select: {
                role: true
              }
            },
            name: true
          }
        }
      }
    })
  }

  public getPostIncludingUserId(post_id: string) {
    return this.post.findFirst({
      where: {
        post_id,
        deletedAt: null
      },
      select: {
        body: true,
        member: {
          select: {
            user_id: true
          }
        }
      }
    })
  }

  /**
   *
   * @param community_id
   * @param page
   * @param limit
   * @returns array of posts
   */
  public getCommunityPendingPosts(community_id: string, page: number, limit: number) {
    return this.post.findMany({
      where: {
        community_id,
        hasPublished: false,
        deletedAt: null,
        member: {
          leavedAt: null
        }
      },
      select: {
        post_id: true,
        community_id: true,
        body: true,
        image_url: true,
        member: {
          select: {
            member_id: true,
            user: {
              select: {
                user_id: true,
                fullname: true,
                avatar: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    })
  }

  /**
   *
   * @param user_id
   * @param page
   * @param limit
   */
  public getUserFeedPosts(user_id: string, page: number, limit: number) {
    return this.post.findMany({
      where: {
        hasPublished: true,
        isVisible: true,
        deletedAt: null
      },

      include: {
        community: {
          select: {
            name: true,
            members: {
              where: {
                user_id,
                leavedAt: null
              },
              select: {
                user: {
                  select: {
                    user_id: true,
                    fullname: true,
                    username: true,
                    avatar: true
                  }
                }
              }
            }
          }
        },

        reacts: {
          where: {
            member: {
              user_id
            }
          },
          select: {
            react_type: true
          }
        },
        member: {
          select: {
            user: {
              select: {
                fullname: true,
                username: true,
                avatar: true
              }
            }
          }
        }
      },

      // include: {
      //   member: {
      //     select: {
      //       user: {
      //         select: {
      //           user_id: true,
      //           fullname: true,
      //           username: true,
      //           avatar: true
      //         }
      //       }
      //     }
      //   },

      // community: {
      //   select: {
      //     name: true
      //   }
      // }
      // },

      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    })
  }

  /**
   * get community posts via pagination or all posts
   * @param community_id this should community_id
   * @param page optional filed
   * @param limit optional field
   * @returns community_id member_id title body createdAt updatedAt
   */
  public getPostsInCommunity(community_id: string, user_id: string, page: number, limit: number) {
    return this.post.findMany({
      relationLoadStrategy: 'join',
      where: {
        community_id,
        hasPublished: true,
        isVisible: true,
        deletedAt: null
      },
      select: {
        post_id: true,
        community_id: true,
        member_id: true,
        body: true,
        image_url: true,
        createdAt: true,
        updatedAt: true,
        member: {
          select: {
            user: {
              select: {
                user_id: true,
                fullname: true,
                username: true,
                avatar: true
              }
            }
          }
        },

        reacts: {
          where: {
            member: {
              user_id
            }
          },
          select: {
            // post_id: true,
            // react_id: true,
            react_type: true
          }
        },
        // reacts: {
        //   where: {
        //     member_id
        //   },
        //   select: {
        //     react_type: true
        //   }
        // },

        community: {
          select: {
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    })
  }

  /**
   * get community posts via pagination or all posts
   * @param community_id
   * @param user_id
   * @param page
   * @param limit
   */
  public getCurrentUserPendingPosts(community_id: string, user_id: string, page: number, limit: number) {
    return this.post.findMany({
      relationLoadStrategy: 'join',
      where: {
        community_id,
        member: {
          user_id
        },
        hasPublished: false,
        deletedAt: null
      },
      select: {
        post_id: true,
        community_id: true,
        body: true,
        image_url: true,
        member: {
          select: {
            member_id: true,
            user: {
              select: {
                user_id: true,
                fullname: true,
                avatar: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    })
  }

  /**
   *
   * @param {String} community_id Community ID
   * @returns {Promise<Number>}
   */
  public numOfPostsInCommunity(community_id: string): Promise<number> {
    return this.post.count({
      where: {
        community_id,
        hasPublished: true,
        isVisible: true,
        deletedAt: null
      }
    })
  }
  /**
   *
   * @param {String} user_id user id
   * @returns {Promise<Number>}
   */
  public numOfPostsOfUser(user_id: string): Promise<number> {
    return this.post.count({
      where: {
        member: {
          user_id
        },
        deletedAt: null,
        isVisible: true,
        hasPublished: true
      }
    })
  }

  /**
   * numOfPendingPostsInCommunity
   */
  public numOfPendingPostsInCommunity(community_id: string) {
    return this.post.count({
      where: {
        community_id,
        hasPublished: false,
        deletedAt: null
      }
    })
  }

  /**
   * currentUserPendingPostsCount
   */
  public currentUserPendingPostsCount(community_id: string, user_id: string) {
    return this.post.count({
      where: {
        community_id,
        member: {
          user_id
        },
        hasPublished: false,
        deletedAt: null
      }
    })
  }
}

export default new PostRepo()
