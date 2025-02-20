import { useIntl, FormattedMessage } from 'react-intl'
import React, { useEffect, useRef, useState } from 'react'

import BlogHeader from '../components/blogHeader'
import { Button } from '@seagreenio/react-bulma'
import Labels from '../components/labels'
import Layout from '../components/layout'
import Link from '../components/IntlLink'
import { MDXProvider } from '@mdx-js/react'
import { MDXRenderer } from 'gatsby-plugin-mdx'
import { MenuGenerator } from '../components/menu'
import SEO from '../components/seo'
import Socials from '../components/socials'
import TOCRenderer from '../components/tocRenderer'
import { categoryMenuItemForBlogAndCase } from '../lib/menuCfgGenerator'
import { getBaseSchemaProxyHandler } from '../lib/proxy'
import { graphql } from 'gatsby'
import { replaceSpaceWithDash } from '../lib/string'

const CategoryMenu = React.memo(({ isDesktop = true, menuConfig }) => {
  return (
    <div className={`categories-and-tags${isDesktop ? ' desktop' : ' mobile'}`}>
      <MenuGenerator menuConfig={menuConfig} />
    </div>
  )
})

const CaseStudy = ({ data, pageContext }) => {
  const [showProgress, setShowProgress] = useState(false)
  const [readingProgress, setReadingProgress] = useState(0)
  const [fixedSocials, setFixedSocials] = useState(true)
  const [isFirstRender, setIsFirstRender] = useState(true)
  const intl = useIntl()

  useEffect(() => {
    setIsFirstRender(false)
    const footer = document.querySelector('.footer.PingCAP-Footer')
    const footerHeight = footer.getBoundingClientRect().height

    let isReachFooter = false

    const scrollListener = () => {
      const winScrollHeight = document.documentElement.scrollHeight
      const winClientHeight = document.documentElement.clientHeight
      const winScrollTop = document.documentElement.scrollTop
      const toFooter = winScrollHeight - winClientHeight - footerHeight

      setShowProgress(winScrollTop > 0)

      if (winScrollTop > toFooter && !isReachFooter) {
        setFixedSocials(false)
        isReachFooter = true
      }

      if (winScrollTop < toFooter && isReachFooter) {
        setFixedSocials(true)
        isReachFooter = false
      }

      const height = winScrollHeight - winClientHeight
      const scrolled = ((winScrollTop / height) * 100).toFixed()
      setReadingProgress(scrolled)
    }

    window.addEventListener('scroll', scrollListener)

    return () => window.removeEventListener('scroll', scrollListener)
  }, [])

  const { mdx } = data
  const { frontmatter, body: html, tableOfContents } = mdx
  const filePath = { pageContext }
  let { industries, companies, tags } = pageContext
  industries = [...industries]
  companies = [...companies]
  tags = [...tags]
  const category = frontmatter.customerCategory

  const currentIndustry = frontmatter.customerCategory
  const currentCompany = frontmatter.customer
  const currentTag = frontmatter.tags

  if (isFirstRender) {
    industries && industries.unshift('All')
    companies && companies.unshift('All')
    tags && tags.unshift('All')
  }

  const baseCateMenuCfg = {
    menu: {
      className: 'titles',
      selectedClassName: 'active',
    },
    menuItems: {
      linkedItem: Labels,
      props: {
        className: 'labels',
        selectedClassName: 'active',
      },
    },
  }

  const categoryMenuConfig = {
    menu: {
      defaultKey: 'industry',
    },
    menuItems: [
      categoryMenuItemForBlogAndCase(
        'industry',
        'title is-6 categories-title',
        'Industries',
        'case'
      )('industry')(industries, currentIndustry),
      categoryMenuItemForBlogAndCase(
        'company',
        'title is-6 categories-title',
        'Companies',
        'case'
      )('company')(companies, currentCompany),
      categoryMenuItemForBlogAndCase(
        'tag',
        'title is-6 categories-title',
        'Tags',
        'case'
      )('tag')(tags, currentTag),
    ],
  }

  const cateMenuCfgMergedWithBase = new Proxy(
    categoryMenuConfig,
    getBaseSchemaProxyHandler(baseCateMenuCfg)
  )

  const cateMenuCfgMergedWithBaseRef = useRef(cateMenuCfgMergedWithBase)

  return (
    <Layout>
      <SEO
        title={frontmatter.title}
        description={frontmatter.summary}
        link={[
          {
            rel: 'stylesheet',
            href:
              'https://cdn.jsdelivr.net/gh/sindresorhus/github-markdown-css@3.0.1/github-markdown.css',
          },
        ]}
        image={frontmatter.image ? frontmatter.image : null}
      />
      <article className="PingCAP-Blog">
        {showProgress && (
          <progress
            className="progress is-primary blog-progress"
            value={readingProgress}
            max="100"
          >
            {readingProgress}
          </progress>
        )}
        <section className="section section-blog">
          <div className="container">
            <div className="columns">
              <div className="column is-7">
                <div className="under-category">
                  <Link to="/case-studies">Case Studies</Link>
                  <span> > </span>
                  <Link
                    to={`/case-studies/${
                      intl.locale === 'en'
                        ? replaceSpaceWithDash(category)
                        : category
                    }`}
                  >
                    {category}
                  </Link>
                </div>
                <BlogHeader
                  frontmatter={frontmatter}
                  filePath={filePath}
                  isCaseStudy
                  isBodyH1Title={true}
                />
                <div className="markdown-body blog-content">
                  <MDXProvider>
                    <MDXRenderer>{html}</MDXRenderer>
                  </MDXProvider>
                </div>
                <section className="section get-started-with-tidb">
                  <h3 className="title">
                    <FormattedMessage
                      id="templates.blog.getStartedTitle"
                      defaultMessage="Ready to get started with TiDB?"
                    />
                  </h3>
                  <div className="destinations">
                    <Button
                      as={Link}
                      to="/download"
                      className="get-started"
                      outlined
                      rounded
                    >
                      <FormattedMessage
                        id="templates.blog.getStartedText"
                        defaultMessage="GET TiDB"
                      />
                    </Button>
                    <Button as={Link} to="/contact-us" outlined rounded>
                      <FormattedMessage
                        id="templates.blog.contactUsText"
                        defaultMessage="CONTACT US"
                      />
                    </Button>
                  </div>
                </section>
              </div>
              <div className="column is-4 is-offset-1 right-column">
                <div className="toc">
                  <div className="title is-6">What's on this page</div>
                  <div className="toc-content">
                    <TOCRenderer>{tableOfContents.items}</TOCRenderer>
                  </div>
                </div>
                <div
                  className="follow-us"
                  style={{ display: fixedSocials ? 'block' : 'none' }}
                >
                  <div className="title is-6">Welcome to share this post!</div>
                  <div className="socials">
                    <Socials type="share" title={frontmatter.title} />
                  </div>
                </div>
                <CategoryMenu
                  menuConfig={cateMenuCfgMergedWithBaseRef.current}
                />
              </div>
            </div>
          </div>
        </section>
      </article>
    </Layout>
  )
}

// TODO: tableOfContents query: absolute: false, pathToSlugField: "frontmatter.title"
export const query = graphql`
  query($title: String) {
    mdx(frontmatter: { title: { eq: $title } }) {
      body
      frontmatter {
        title
        summary
        date(formatString: "YYYY-MM-DD")
        customer
        customerCategory
        tags
        image
      }
      tableOfContents
    }
  }
`

export default CaseStudy
